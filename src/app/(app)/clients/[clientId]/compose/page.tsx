import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { getProfiles, getPlacements } from "@/actions/profiles";
import { ComposeForm } from "@/components/compose-form";
import type { Placement } from "postproxy-sdk";

export default async function ComposePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  const profiles = await getProfiles(client.postproxy_profile_group_id);

  // Fetch placements for platforms that need them (facebook, linkedin, pinterest)
  const placementPlatforms = new Set(["facebook", "linkedin", "pinterest"]);
  const placementsMap: Record<string, Placement[]> = {};

  await Promise.all(
    profiles
      .filter((p) => placementPlatforms.has(p.platform) && p.status === "active")
      .map(async (p) => {
        try {
          placementsMap[p.id] = await getPlacements(
            p.id,
            client.postproxy_profile_group_id
          );
        } catch {
          placementsMap[p.id] = [];
        }
      })
  );

  return (
    <div className="p-8 max-w-2xl">
      <div className="bg-card border border-border rounded-xl p-6">
        <ComposeForm
          clientId={clientId}
          profiles={profiles}
          placements={placementsMap}
        />
      </div>
    </div>
  );
}
