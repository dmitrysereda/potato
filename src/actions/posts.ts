"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import getPostProxy from "@/lib/postproxy";
import { getClient } from "./clients";
import type { PostStatus, ThreadChildInput, PlatformParams } from "postproxy-sdk";

async function saveUploadedFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const dir = join(tmpdir(), "potato-uploads");
  await mkdir(dir, { recursive: true });

  const paths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop() || "bin";
    const path = join(dir, `${randomUUID()}.${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path, buffer);
    paths.push(path);
  }
  return paths;
}

async function cleanupFiles(paths: string[]) {
  for (const path of paths) {
    try {
      await unlink(path);
    } catch {
      // best-effort
    }
  }
}

async function buildThread(formData: FormData, threadJson: string): Promise<{ thread: ThreadChildInput[]; filePaths: string[] }> {
  if (!threadJson) return { thread: [], filePaths: [] };

  const raw: { body: string; media?: string[]; hasFiles?: boolean; fileKey?: string }[] = JSON.parse(threadJson);
  const allFilePaths: string[] = [];
  const thread: ThreadChildInput[] = [];

  for (const part of raw) {
    const entry: ThreadChildInput = { body: part.body };

    if (part.media && part.media.length > 0) {
      entry.media = part.media;
    } else if (part.hasFiles && part.fileKey) {
      const files = formData.getAll(part.fileKey) as File[];
      const valid = files.filter((f) => f.size > 0);
      if (valid.length > 0) {
        const paths = await saveUploadedFiles(valid);
        entry.mediaFiles = paths;
        allFilePaths.push(...paths);
      }
    }

    thread.push(entry);
  }

  return { thread, filePaths: allFilePaths };
}

export async function createPost(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const body = formData.get("body") as string;
  const profileIds = JSON.parse(formData.get("profileIds") as string) as string[];
  const mediaUrls = JSON.parse(formData.get("mediaUrls") as string) as string[];
  const scheduledAt = formData.get("scheduledAt") as string;
  const isDraft = formData.get("draft") === "true";
  const threadJson = formData.get("thread") as string;
  const platformsJson = formData.get("platforms") as string;

  const mediaFiles = formData.getAll("files") as File[];
  const validFiles = mediaFiles.filter((f) => f.size > 0);

  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  const filePaths = await saveUploadedFiles(validFiles);
  const { thread, filePaths: threadFilePaths } = await buildThread(formData, threadJson);
  const allFilePaths = [...filePaths, ...threadFilePaths];

  let platforms: PlatformParams | undefined;
  if (platformsJson) {
    platforms = JSON.parse(platformsJson) as PlatformParams;
  }

  try {
    await getPostProxy().posts.create(body, profileIds, {
      media: mediaUrls.filter(Boolean).length ? mediaUrls.filter(Boolean) : undefined,
      mediaFiles: filePaths.length ? filePaths : undefined,
      scheduledAt: scheduledAt || undefined,
      draft: isDraft || undefined,
      thread: thread.length ? thread : undefined,
      platforms,
      profileGroupId: client.postproxy_profile_group_id,
    });
  } finally {
    await cleanupFiles(allFilePaths);
  }

  revalidatePath(`/clients/${clientId}/posts`);
  redirect(`/clients/${clientId}/posts`);
}

export async function updatePost(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const postId = formData.get("postId") as string;
  const body = formData.get("body") as string;
  const profileIds = JSON.parse(formData.get("profileIds") as string) as string[];
  const mediaUrls = JSON.parse(formData.get("mediaUrls") as string) as string[];
  const scheduledAt = formData.get("scheduledAt") as string;
  const isDraft = formData.get("draft") === "true";
  const threadJson = formData.get("thread") as string;
  const platformsJson = formData.get("platforms") as string;

  const mediaFiles = formData.getAll("files") as File[];
  const validFiles = mediaFiles.filter((f) => f.size > 0);

  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  const filePaths = await saveUploadedFiles(validFiles);
  const { thread, filePaths: threadFilePaths } = await buildThread(formData, threadJson);
  const allFilePaths = [...filePaths, ...threadFilePaths];

  let platforms: PlatformParams | undefined;
  if (platformsJson) {
    platforms = JSON.parse(platformsJson) as PlatformParams;
  }

  try {
    await getPostProxy().posts.update(postId, {
      body: body || undefined,
      profiles: profileIds.length ? profileIds : undefined,
      media: mediaUrls.filter(Boolean).length ? mediaUrls.filter(Boolean) : undefined,
      mediaFiles: filePaths.length ? filePaths : undefined,
      scheduledAt: scheduledAt || undefined,
      draft: isDraft || undefined,
      thread: threadJson ? thread : undefined,
      platforms,
      profileGroupId: client.postproxy_profile_group_id,
    });
  } finally {
    await cleanupFiles(allFilePaths);
  }

  revalidatePath(`/clients/${clientId}/posts`);
  redirect(`/clients/${clientId}/posts`);
}

export async function deletePost(clientId: string, postId: string) {
  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  await getPostProxy().posts.delete(postId, {
    profileGroupId: client.postproxy_profile_group_id,
  });

  revalidatePath(`/clients/${clientId}/posts`);
}

export async function publishDraft(clientId: string, postId: string) {
  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  await getPostProxy().posts.publishDraft(postId, {
    profileGroupId: client.postproxy_profile_group_id,
  });

  revalidatePath(`/clients/${clientId}/posts`);
}

export async function getPosts(
  profileGroupId: string,
  options?: { status?: string; page?: number }
) {
  return getPostProxy().posts.list({
    profileGroupId,
    status: options?.status as PostStatus,
    page: options?.page,
    perPage: 20,
  });
}

export async function getPost(postId: string, profileGroupId: string) {
  try {
    return await getPostProxy().posts.get(postId, { profileGroupId });
  } catch {
    return null;
  }
}
