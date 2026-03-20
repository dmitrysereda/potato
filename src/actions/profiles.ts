"use server";

import { revalidatePath } from "next/cache";
import type { Platform } from "postproxy-sdk";
import getPostProxy from "@/lib/postproxy";
import { getClient } from "./clients";

export async function connectPlatform(clientId: string, platform: Platform) {
  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = `${appUrl}/callback?clientId=${clientId}`;

  const result = await getPostProxy().profileGroups.initializeConnection(
    client.postproxy_profile_group_id,
    platform,
    callbackUrl
  );

  return { url: result.url };
}

export async function disconnectProfile(clientId: string, profileId: string) {
  const client = await getClient(clientId);
  if (!client) return { error: "Client not found" };

  await getPostProxy().profiles.delete(profileId, {
    profileGroupId: client.postproxy_profile_group_id,
  });

  revalidatePath(`/clients/${clientId}/profiles`);
}

export async function getProfiles(profileGroupId: string) {
  const { data } = await getPostProxy().profiles.list({ profileGroupId });
  return data;
}

export async function getPlacements(profileId: string, profileGroupId: string) {
  const { data } = await getPostProxy().profiles.placements(profileId, {
    profileGroupId,
  });
  return data;
}
