"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { connectPlatform } from "@/actions/profiles";
import { PLATFORMS } from "@/lib/platforms";
import type { Platform } from "postproxy-sdk";

export function ConnectButton({ clientId, connectedPlatforms = [] }: { clientId: string; connectedPlatforms?: Platform[] }) {
  async function handleConnect(platform: Platform) {
    const result = await connectPlatform(clientId, platform);
    if (result.url) {
      window.location.href = result.url;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md bg-primary text-white hover:opacity-90 transition-colors">
        Connect Account
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PLATFORMS.filter((p) => !connectedPlatforms.includes(p.value)).sort((a, b) => a.label.localeCompare(b.label)).map((platform) => (
          <DropdownMenuItem
            key={platform.value}
            onClick={() => handleConnect(platform.value)}
          >
            {platform.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
