"use client";

import { Button } from "@/components/ui/button";
import { disconnectProfile } from "@/actions/profiles";

export function DisconnectButton({
  clientId,
  profileId,
}: {
  clientId: string;
  profileId: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={async () => {
        if (confirm("Disconnect this account?")) {
          await disconnectProfile(clientId, profileId);
        }
      }}
    >
      Disconnect
    </Button>
  );
}
