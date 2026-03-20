import type { Platform } from "postproxy-sdk";

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "threads", label: "Threads" },
  { value: "pinterest", label: "Pinterest" },
];

export function getPlatformLabel(platform: Platform) {
  return PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}
