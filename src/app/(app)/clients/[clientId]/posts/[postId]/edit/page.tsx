import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { getPost } from "@/actions/posts";
import { getProfiles, getPlacements } from "@/actions/profiles";
import { ComposeForm } from "@/components/compose-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Placement } from "postproxy-sdk";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ clientId: string; postId: string }>;
}) {
  const { clientId, postId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  const [post, profiles] = await Promise.all([
    getPost(postId, client.postproxy_profile_group_id),
    getProfiles(client.postproxy_profile_group_id),
  ]);

  if (!post) notFound();

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
    <div className="p-8 max-w-2xl space-y-4">
      <Link
        href={`/clients/${clientId}/posts/${postId}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to post
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <ComposeForm
            clientId={clientId}
            profiles={profiles}
            placements={placementsMap}
            initialData={post}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
