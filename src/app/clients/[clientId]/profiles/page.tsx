import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { getProfiles } from "@/actions/profiles";
import { getPlatformLabel } from "@/lib/platforms";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from "@/components/connect-button";
import { DisconnectButton } from "@/components/disconnect-button";

export default async function ProfilesPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  const profiles = await getProfiles(client.postproxy_profile_group_id);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold">Connected Accounts</h2>
        <ConnectButton clientId={clientId} connectedPlatforms={profiles.map((p) => p.platform)} />
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-sm">No accounts connected yet.</p>
          <p className="text-xs mt-1.5">Connect a social account to start posting.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getPlatformLabel(profile.platform)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                  {profile.status}
                </Badge>
                {profile.expires_at && (
                  <span className="text-xs text-muted-foreground">
                    expires {new Date(profile.expires_at).toLocaleDateString()}
                  </span>
                )}
                <DisconnectButton clientId={clientId} profileId={profile.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
