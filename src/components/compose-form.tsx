"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createPost, updatePost } from "@/actions/posts";
import type { Profile, Post, Placement, PlatformParams } from "postproxy-sdk";
import { getPlatformLabel } from "@/lib/platforms";

const THREAD_PLATFORMS = new Set(["threads", "twitter"]);

interface ComposeFormProps {
  clientId: string;
  profiles: Profile[];
  placements?: Record<string, Placement[]>;
  initialData?: Post;
  mode?: "create" | "edit";
}

interface ThreadPart {
  body: string;
  mediaMode: "url" | "file";
  mediaUrls: string[];
  files: File[];
}

export function ComposeForm({
  clientId,
  profiles,
  placements = {},
  initialData,
  mode = "create",
}: ComposeFormProps) {
  const [body, setBody] = useState(initialData?.body ?? "");
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(
    initialData?.platforms?.map((p) => {
      const match = profiles.find((pr) => pr.platform === p.platform);
      return match?.id ?? "";
    }).filter(Boolean) ?? []
  );
  const [mediaMode, setMediaMode] = useState<"url" | "file">(
    initialData?.media?.length ? "url" : "url"
  );
  const [mediaUrls, setMediaUrls] = useState<string[]>(
    initialData?.media?.map((m) => m.source_url ?? "").filter(Boolean) ?? [""]
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (!initialData?.scheduled_at) return "";
    const d = new Date(initialData.scheduled_at);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [isDraft, setIsDraft] = useState(() => {
    if (!initialData) return false;
    // The API returns draft as a boolean attribute, but the SDK type doesn't expose it
    if ("draft" in initialData && (initialData as Record<string, unknown>).draft) return true;
    return initialData.status === "draft";
  });
  const [threadParts, setThreadParts] = useState<ThreadPart[]>(
    initialData?.thread?.map((t) => ({
      body: t.body,
      mediaMode: "url" as const,
      mediaUrls: t.media?.map((m) => m.source_url ?? "").filter(Boolean) ?? [],
      files: [],
    })) ?? []
  );
  const threadFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Platform-specific params — hydrate from existing post data on edit
  const [platformParams, setPlatformParams] = useState<PlatformParams>(() => {
    if (!initialData?.platforms) return {};
    const params: PlatformParams = {};
    for (const p of initialData.platforms) {
      if (p.params && Object.keys(p.params).length > 0) {
        (params as Record<string, unknown>)[p.platform] = { ...p.params };
      }
    }
    return params;
  });

  const selectedPlatforms = profiles
    .filter((p) => selectedProfiles.includes(p.id))
    .map((p) => p.platform);

  const uniquePlatforms = [...new Set(selectedPlatforms)];

  const canThread = selectedPlatforms.some((p) => THREAD_PLATFORMS.has(p));

  function updatePlatformParam<K extends keyof PlatformParams>(
    platform: K,
    key: string,
    value: unknown,
  ) {
    setPlatformParams((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [key]: value },
    }));
  }

  function toggleProfile(profileId: string) {
    setSelectedProfiles((prev) => {
      const next = prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId];

      const nextPlatforms = profiles
        .filter((p) => next.includes(p.id))
        .map((p) => p.platform);
      if (!nextPlatforms.some((p) => THREAD_PLATFORMS.has(p))) {
        setThreadParts([]);
      }

      return next;
    });
  }

  function addMediaUrl() {
    setMediaUrls((prev) => [...prev, ""]);
  }

  function updateMediaUrl(index: number, value: string) {
    setMediaUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  }

  function removeMediaUrl(index: number) {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function addThreadPart() {
    setThreadParts((prev) => [...prev, { body: "", mediaMode: "url", mediaUrls: [], files: [] }]);
  }

  function updateThreadPart(index: number, updates: Partial<ThreadPart>) {
    setThreadParts((prev) =>
      prev.map((part, i) => (i === index ? { ...part, ...updates } : part))
    );
  }

  function addThreadPartMediaUrl(index: number) {
    setThreadParts((prev) =>
      prev.map((part, i) => (i === index ? { ...part, mediaUrls: [...part.mediaUrls, ""] } : part))
    );
  }

  function updateThreadPartMediaUrl(partIndex: number, mediaIndex: number, value: string) {
    setThreadParts((prev) =>
      prev.map((part, i) =>
        i === partIndex
          ? { ...part, mediaUrls: part.mediaUrls.map((url, j) => (j === mediaIndex ? value : url)) }
          : part
      )
    );
  }

  function removeThreadPartMediaUrl(partIndex: number, mediaIndex: number) {
    setThreadParts((prev) =>
      prev.map((part, i) =>
        i === partIndex
          ? { ...part, mediaUrls: part.mediaUrls.filter((_, j) => j !== mediaIndex) }
          : part
      )
    );
  }

  function handleThreadFileChange(partIndex: number, e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) {
      setThreadParts((prev) =>
        prev.map((part, i) => (i === partIndex ? { ...part, files: [...part.files, ...newFiles] } : part))
      );
    }
    const ref = threadFileRefs.current[partIndex];
    if (ref) ref.value = "";
  }

  function removeThreadPartFile(partIndex: number, fileIndex: number) {
    setThreadParts((prev) =>
      prev.map((part, i) =>
        i === partIndex
          ? { ...part, files: part.files.filter((_, j) => j !== fileIndex) }
          : part
      )
    );
  }

  function removeThreadPart(index: number) {
    setThreadParts((prev) => prev.filter((_, i) => i !== index));
  }

  // Build cleaned platform params (only include non-empty values for selected platforms)
  function buildPlatformParams(): PlatformParams | undefined {
    const result: PlatformParams = {};
    let hasAny = false;

    for (const platform of uniquePlatforms) {
      const params = platformParams[platform as keyof PlatformParams];
      if (!params) continue;

      const cleaned: Record<string, unknown> = {};
      let hasField = false;

      for (const [key, value] of Object.entries(params)) {
        if (value === "" || value === undefined || value === null) continue;
        if (value === false) continue;
        if (Array.isArray(value) && value.length === 0) continue;
        cleaned[key] = value;
        hasField = true;
      }

      if (hasField) {
        (result as Record<string, unknown>)[platform] = cleaned;
        hasAny = true;
      }
    }

    return hasAny ? result : undefined;
  }

  async function handleSubmit() {
    if (!body.trim() || selectedProfiles.length === 0) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("clientId", clientId);
      formData.set("body", body);
      formData.set("profileIds", JSON.stringify(selectedProfiles));
      formData.set("mediaUrls", JSON.stringify(mediaUrls.filter(Boolean)));
      formData.set("scheduledAt", scheduledAt || "");
      formData.set("draft", isDraft ? "true" : "false");

      for (const file of files) {
        formData.append("files", file);
      }

      const threadData = threadParts.filter((p) => p.body.trim()).map((p, i) => ({
        body: p.body,
        media: p.mediaMode === "url" && p.mediaUrls.filter(Boolean).length ? p.mediaUrls.filter(Boolean) : undefined,
        hasFiles: p.mediaMode === "file" && p.files.length > 0,
        fileKey: `thread_files_${i}`,
      }));
      if (threadData.length > 0 || mode === "edit") {
        formData.set("thread", JSON.stringify(threadData));
        for (let i = 0; i < threadParts.length; i++) {
          if (threadParts[i].mediaMode === "file") {
            for (const file of threadParts[i].files) {
              formData.append(`thread_files_${i}`, file);
            }
          }
        }
      }

      const platforms = buildPlatformParams();
      if (platforms) {
        formData.set("platforms", JSON.stringify(platforms));
      }

      if (mode === "edit" && initialData) {
        formData.set("postId", initialData.id);
        await updatePost(formData);
      } else {
        await createPost(formData);
      }
    } catch {
      setSubmitting(false);
    }
  }

  // Get placements for a specific selected profile
  function getProfilePlacements(platform: string): Placement[] {
    const profile = profiles.find(
      (p) => p.platform === platform && selectedProfiles.includes(p.id)
    );
    if (!profile) return [];
    return placements[profile.id] ?? [];
  }

  return (
    <div className="space-y-6">
      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No profiles connected. Connect accounts first.
        </p>
      ) : (
        <div className="space-y-2">
          <Label>Post to</Label>
          <div className="flex flex-wrap gap-2">
            {profiles.map((profile) => {
              const selected = selectedProfiles.includes(profile.id);
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => toggleProfile(profile.id)}
                  style={selected ? { backgroundColor: "oklch(0.30 0.04 55)", color: "oklch(0.97 0.005 75)", borderColor: "oklch(0.30 0.04 55)" } : {}}
                  className={`cursor-pointer px-3 py-1.5 text-sm border rounded-lg transition-all duration-150 ${
                    selected
                      ? ""
                      : "bg-card text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {profile.name}
                  <span className={`ml-2 text-xs ${selected ? "opacity-80" : "opacity-60"}`}>
                    {getPlatformLabel(profile.platform)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Post</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post..."
          rows={5}
        />
        <p className="text-xs text-muted-foreground/60 text-right">
          {body.length} characters
        </p>
      </div>

      <div className="space-y-3">
        <Label>Media</Label>
        <div style={{ display: "inline-flex", borderRadius: "8px", backgroundColor: "oklch(0.955 0.008 75)", padding: "4px" }} className="text-sm">
          <button
            type="button"
            onClick={() => { setMediaMode("url"); setFiles([]); }}
            style={mediaMode === "url" ? { backgroundColor: "oklch(0.99 0.003 80)", color: "oklch(0.22 0.02 50)", boxShadow: "0 1px 3px rgba(80,50,20,0.08)", fontWeight: 500, borderRadius: "6px", padding: "4px 12px" } : { color: "oklch(0.52 0.02 55)", borderRadius: "6px", padding: "4px 12px" }}
            className="cursor-pointer transition-all"
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => { setMediaMode("file"); setMediaUrls([""]); }}
            style={mediaMode === "file" ? { backgroundColor: "oklch(0.99 0.003 80)", color: "oklch(0.22 0.02 50)", boxShadow: "0 1px 3px rgba(80,50,20,0.08)", fontWeight: 500, borderRadius: "6px", padding: "4px 12px" } : { color: "oklch(0.52 0.02 55)", borderRadius: "6px", padding: "4px 12px" }}
            className="cursor-pointer transition-all"
          >
            Upload
          </button>
        </div>

        {mediaMode === "url" ? (
          <>
            {mediaUrls.map((url, i) => (
              <div key={`url-${i}`} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateMediaUrl(i, e.target.value)}
                  placeholder="Image or video URL"
                />
                {mediaUrls.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeMediaUrl(i)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addMediaUrl}>
              Add URL
            </Button>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Choose files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((file, i) => (
                  <div
                    key={`file-${i}`}
                    style={{ backgroundColor: "oklch(0.955 0.008 75)", border: "1px solid oklch(0.90 0.01 75)", borderRadius: "8px", padding: "8px 12px" }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="cursor-pointer text-red-500 hover:text-red-700 ml-3 text-xs shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <p className="text-xs" style={{ color: "oklch(0.52 0.02 55)" }}>
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {canThread && (
        <div className="space-y-3">
          <Label>Thread</Label>
          {threadParts.map((part, i) => (
            <div key={i} style={{ border: "1px solid oklch(0.90 0.01 75)", borderRadius: "10px", padding: "14px" }} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Part {i + 2}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeThreadPart(i)}>
                  Remove
                </Button>
              </div>
              <Textarea
                value={part.body}
                onChange={(e) => updateThreadPart(i, { body: e.target.value })}
                placeholder="Continue the thread..."
                rows={3}
              />
              <div className="space-y-2">
                <div style={{ display: "inline-flex", borderRadius: "6px", backgroundColor: "oklch(0.955 0.008 75)", padding: "3px" }} className="text-xs">
                  <button
                    type="button"
                    onClick={() => updateThreadPart(i, { mediaMode: "url", files: [] })}
                    style={part.mediaMode === "url" ? { backgroundColor: "oklch(0.99 0.003 80)", color: "oklch(0.22 0.02 50)", boxShadow: "0 1px 3px rgba(80,50,20,0.08)", fontWeight: 500, borderRadius: "4px", padding: "3px 10px" } : { color: "oklch(0.52 0.02 55)", borderRadius: "4px", padding: "3px 10px" }}
                    className="cursor-pointer"
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => updateThreadPart(i, { mediaMode: "file", mediaUrls: [] })}
                    style={part.mediaMode === "file" ? { backgroundColor: "oklch(0.99 0.003 80)", color: "oklch(0.22 0.02 50)", boxShadow: "0 1px 3px rgba(80,50,20,0.08)", fontWeight: 500, borderRadius: "4px", padding: "3px 10px" } : { color: "oklch(0.52 0.02 55)", borderRadius: "4px", padding: "3px 10px" }}
                    className="cursor-pointer"
                  >
                    Upload
                  </button>
                </div>

                {part.mediaMode === "url" ? (
                  <div className="space-y-1.5">
                    {part.mediaUrls.map((url, j) => (
                      <div key={j} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => updateThreadPartMediaUrl(i, j, e.target.value)}
                          placeholder="Media URL"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeThreadPartMediaUrl(i, j)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addThreadPartMediaUrl(i)}>
                      Add URL
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Button type="button" variant="outline" size="sm" onClick={() => threadFileRefs.current[i]?.click()}>
                      Choose files
                    </Button>
                    <input
                      ref={(el) => { threadFileRefs.current[i] = el; }}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => handleThreadFileChange(i, e)}
                      className="hidden"
                    />
                    {part.files.length > 0 && (
                      <div className="space-y-1">
                        {part.files.map((file, j) => (
                          <div
                            key={j}
                            style={{ backgroundColor: "oklch(0.955 0.008 75)", border: "1px solid oklch(0.90 0.01 75)", borderRadius: "8px", padding: "6px 10px" }}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeThreadPartFile(i, j)}
                              className="cursor-pointer text-red-500 hover:text-red-700 ml-3 shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <p className="text-xs" style={{ color: "oklch(0.52 0.02 55)" }}>
                          {part.files.length} file{part.files.length !== 1 ? "s" : ""} selected
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addThreadPart}>
            Add thread part
          </Button>
        </div>
      )}

      {/* Platform-specific options */}
      {uniquePlatforms.length > 0 && (
        <PlatformOptions
          platforms={uniquePlatforms}
          params={platformParams}
          onUpdate={updatePlatformParam}
          getPlacements={getProfilePlacements}
        />
      )}

      <div className="border-t pt-5 space-y-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="draft"
              checked={isDraft}
              onCheckedChange={(checked) => {
                setIsDraft(checked === true);
                if (checked) setScheduledAt("");
              }}
            />
            <Label htmlFor="draft" className="font-normal">Save as draft</Label>
          </div>

          {!isDraft && (
            <div className="flex items-center gap-2">
              <Label htmlFor="scheduledAt" className="font-normal text-muted-foreground whitespace-nowrap">
                Schedule for
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-auto"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!body.trim() || selectedProfiles.length === 0 || submitting}
          className="w-full"
        >
          {submitting
            ? "Sending..."
            : isDraft
            ? "Save Draft"
            : scheduledAt
            ? "Schedule Post"
            : mode === "edit"
            ? "Update Post"
            : "Publish Now"}
        </Button>
      </div>
    </div>
  );
}

// --- Platform-specific options component ---

function PlatformOptions({
  platforms,
  params,
  onUpdate,
  getPlacements,
}: {
  platforms: string[];
  params: PlatformParams;
  onUpdate: (platform: keyof PlatformParams, key: string, value: unknown) => void;
  getPlacements: (platform: string) => Placement[];
}) {
  const hasPlatform = (p: string) => platforms.includes(p);

  const sectionStyle = {
    border: "1px solid oklch(0.90 0.01 75)",
    borderRadius: "10px",
    padding: "14px 16px",
  };

  if (
    !hasPlatform("facebook") &&
    !hasPlatform("instagram") &&
    !hasPlatform("tiktok") &&
    !hasPlatform("linkedin") &&
    !hasPlatform("youtube") &&
    !hasPlatform("pinterest")
  ) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label>Platform options</Label>

      {hasPlatform("facebook") && (
        <div style={sectionStyle} className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Facebook</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Format</label>
              <select
                value={params.facebook?.format ?? "post"}
                onChange={(e) => onUpdate("facebook", "format", e.target.value)}
                className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
              >
                <option value="post">Post</option>
                <option value="story">Story</option>
              </select>
            </div>
            {(() => {
              const fbPlacements = getPlacements("facebook");
              if (fbPlacements.length === 0) return null;
              return (
                <div>
                  <label className="block text-[13px] text-muted-foreground mb-1">Page</label>
                  <select
                    value={params.facebook?.page_id ?? ""}
                    onChange={(e) => onUpdate("facebook", "page_id", e.target.value || undefined)}
                    className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
                  >
                    <option value="">Default</option>
                    {fbPlacements.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              );
            })()}
          </div>
          <div>
            <label className="block text-[13px] text-muted-foreground mb-1">First comment</label>
            <Input
              value={params.facebook?.first_comment ?? ""}
              onChange={(e) => onUpdate("facebook", "first_comment", e.target.value)}
              placeholder="Optional first comment"
            />
          </div>
        </div>
      )}

      {hasPlatform("instagram") && (
        <div style={sectionStyle} className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Instagram</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Format</label>
              <select
                value={params.instagram?.format ?? "post"}
                onChange={(e) => onUpdate("instagram", "format", e.target.value)}
                className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
              >
                <option value="post">Post</option>
                <option value="reel">Reel</option>
                <option value="story">Story</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Cover URL</label>
              <Input
                value={params.instagram?.cover_url ?? ""}
                onChange={(e) => onUpdate("instagram", "cover_url", e.target.value)}
                placeholder="Cover image URL"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-muted-foreground mb-1">First comment</label>
            <Input
              value={params.instagram?.first_comment ?? ""}
              onChange={(e) => onUpdate("instagram", "first_comment", e.target.value)}
              placeholder="Optional first comment"
            />
          </div>
          <div>
            <label className="block text-[13px] text-muted-foreground mb-1">Collaborators</label>
            <Input
              value={params.instagram?.collaborators?.join(", ") ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                const collabs = val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
                onUpdate("instagram", "collaborators", collabs.length ? collabs : undefined);
              }}
              placeholder="@handle1, @handle2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Audio name</label>
              <Input
                value={params.instagram?.audio_name ?? ""}
                onChange={(e) => onUpdate("instagram", "audio_name", e.target.value)}
                placeholder="For reels"
              />
            </div>
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Thumb offset</label>
              <Input
                type="number"
                value={params.instagram?.thumb_offset ?? ""}
                onChange={(e) => onUpdate("instagram", "thumb_offset", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="ms"
              />
            </div>
          </div>
        </div>
      )}

      {hasPlatform("tiktok") && (
        <div style={sectionStyle} className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">TikTok</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Format</label>
              <select
                value={params.tiktok?.format ?? "video"}
                onChange={(e) => onUpdate("tiktok", "format", e.target.value)}
                className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
              >
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Privacy</label>
              <select
                value={params.tiktok?.privacy_status ?? "PUBLIC_TO_EVERYONE"}
                onChange={(e) => onUpdate("tiktok", "privacy_status", e.target.value)}
                className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
              >
                <option value="PUBLIC_TO_EVERYONE">Public</option>
                <option value="MUTUAL_FOLLOW_FRIENDS">Friends</option>
                <option value="FOLLOWER_OF_CREATOR">Followers</option>
                <option value="SELF_ONLY">Only me</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <input
                type="checkbox"
                checked={params.tiktok?.auto_add_music ?? false}
                onChange={(e) => onUpdate("tiktok", "auto_add_music", e.target.checked || undefined)}
              />
              Auto-add music
            </label>
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <input
                type="checkbox"
                checked={params.tiktok?.made_with_ai ?? false}
                onChange={(e) => onUpdate("tiktok", "made_with_ai", e.target.checked || undefined)}
              />
              Made with AI
            </label>
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <input
                type="checkbox"
                checked={params.tiktok?.disable_comment ?? false}
                onChange={(e) => onUpdate("tiktok", "disable_comment", e.target.checked || undefined)}
              />
              Disable comments
            </label>
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <input
                type="checkbox"
                checked={params.tiktok?.disable_duet ?? false}
                onChange={(e) => onUpdate("tiktok", "disable_duet", e.target.checked || undefined)}
              />
              Disable duets
            </label>
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <input
                type="checkbox"
                checked={params.tiktok?.disable_stitch ?? false}
                onChange={(e) => onUpdate("tiktok", "disable_stitch", e.target.checked || undefined)}
              />
              Disable stitches
            </label>
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <input
                type="checkbox"
                checked={params.tiktok?.brand_content_toggle ?? false}
                onChange={(e) => onUpdate("tiktok", "brand_content_toggle", e.target.checked || undefined)}
              />
              Brand content
            </label>
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <input
                type="checkbox"
                checked={params.tiktok?.brand_organic_toggle ?? false}
                onChange={(e) => onUpdate("tiktok", "brand_organic_toggle", e.target.checked || undefined)}
              />
              Brand organic
            </label>
          </div>
        </div>
      )}

      {hasPlatform("linkedin") && (
        <div style={sectionStyle} className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">LinkedIn</p>
          {(() => {
            const liPlacements = getPlacements("linkedin");
            if (liPlacements.length === 0) return null;
            return (
              <div>
                <label className="block text-[13px] text-muted-foreground mb-1">Organization</label>
                <select
                  value={params.linkedin?.organization_id ?? ""}
                  onChange={(e) => onUpdate("linkedin", "organization_id", e.target.value || undefined)}
                  className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
                >
                  <option value="">Personal profile</option>
                  {liPlacements.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            );
          })()}
        </div>
      )}

      {hasPlatform("youtube") && (
        <div style={sectionStyle} className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">YouTube</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Title</label>
              <Input
                value={params.youtube?.title ?? ""}
                onChange={(e) => onUpdate("youtube", "title", e.target.value)}
                placeholder="Video title"
              />
            </div>
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Privacy</label>
              <select
                value={params.youtube?.privacy_status ?? "public"}
                onChange={(e) => onUpdate("youtube", "privacy_status", e.target.value)}
                className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-muted-foreground mb-1">Cover URL</label>
            <Input
              value={params.youtube?.cover_url ?? ""}
              onChange={(e) => onUpdate("youtube", "cover_url", e.target.value)}
              placeholder="Thumbnail image URL"
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <input
              type="checkbox"
              checked={params.youtube?.made_for_kids ?? false}
              onChange={(e) => onUpdate("youtube", "made_for_kids", e.target.checked || undefined)}
            />
            Made for kids
          </label>
        </div>
      )}

      {hasPlatform("pinterest") && (
        <div style={sectionStyle} className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pinterest</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Title</label>
              <Input
                value={params.pinterest?.title ?? ""}
                onChange={(e) => onUpdate("pinterest", "title", e.target.value)}
                placeholder="Pin title"
              />
            </div>
            {(() => {
              const pinPlacements = getPlacements("pinterest");
              if (pinPlacements.length === 0) return null;
              return (
                <div>
                  <label className="block text-[13px] text-muted-foreground mb-1">Board</label>
                  <select
                    value={params.pinterest?.board_id ?? ""}
                    onChange={(e) => onUpdate("pinterest", "board_id", e.target.value || undefined)}
                    className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-card"
                  >
                    <option value="">Select board</option>
                    {pinPlacements.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              );
            })()}
          </div>
          <div>
            <label className="block text-[13px] text-muted-foreground mb-1">Destination link</label>
            <Input
              value={params.pinterest?.destination_link ?? ""}
              onChange={(e) => onUpdate("pinterest", "destination_link", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Cover URL</label>
              <Input
                value={params.pinterest?.cover_url ?? ""}
                onChange={(e) => onUpdate("pinterest", "cover_url", e.target.value)}
                placeholder="Cover image URL"
              />
            </div>
            <div>
              <label className="block text-[13px] text-muted-foreground mb-1">Thumb offset</label>
              <Input
                type="number"
                value={params.pinterest?.thumb_offset ?? ""}
                onChange={(e) => onUpdate("pinterest", "thumb_offset", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="ms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
