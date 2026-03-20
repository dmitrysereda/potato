import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { getPost } from "@/actions/posts";
import { getPlatformLabel } from "@/lib/platforms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PostActions } from "./actions";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  processed: "default",
  scheduled: "outline",
  draft: "secondary",
  pending: "secondary",
  processing: "secondary",
  media_processing_failed: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  processed: "Published",
  scheduled: "Scheduled",
  draft: "Draft",
  pending: "Pending",
  processing: "Processing",
  media_processing_failed: "Failed",
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ clientId: string; postId: string }>;
}) {
  const { clientId, postId } = await params;
  const client = await getClient(clientId);
  if (!client) notFound();

  const post = await getPost(postId, client.postproxy_profile_group_id);
  if (!post) notFound();

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/clients/${clientId}/posts`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to posts
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/clients/${clientId}/posts/${post.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <PostActions
            clientId={clientId}
            postId={post.id}
            status={post.status}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANTS[post.status] ?? "secondary"}>
              {STATUS_LABELS[post.status] ?? post.status}
            </Badge>
            {post.scheduled_at && (
              <span className="text-sm text-muted-foreground">
                {post.status === "scheduled" ? "Scheduled for " : ""}
                {new Date(post.scheduled_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            )}
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Created {new Date(post.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {post.body}
          </p>

          {post.media?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Media
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {post.media.map((m) => (
                    <div
                      key={m.id}
                      className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden ring-1 ring-foreground/5"
                    >
                      {m.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <p>{m.content_type?.split("/")[0] ?? "media"}</p>
                          <p className="text-[10px] mt-1">
                            {m.status === "pending"
                              ? "Processing..."
                              : m.status === "failed"
                              ? m.error_message ?? "Failed"
                              : m.status}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {post.thread?.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thread
                </h3>
                {post.thread.map((part, i) => (
                  <div
                    key={part.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Part {i + 2}
                    </span>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {part.body}
                    </p>
                    {part.media?.length > 0 && (
                      <div className="flex gap-2">
                        {part.media.map((m) => (
                          <div
                            key={m.id}
                            className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden ring-1 ring-foreground/5"
                          >
                            {m.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={m.url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              m.content_type?.split("/")[0] ?? "media"
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Platforms
            </h3>
            <div className="space-y-2">
              {post.platforms?.map((p) => (
                <div
                  key={p.platform}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">
                    {getPlatformLabel(p.platform)}
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    {p.error && (
                      <span className="text-destructive">{p.error}</span>
                    )}
                    {p.attempted_at && (
                      <span>
                        {new Date(p.attempted_at).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    )}
                    <Badge
                      variant={
                        p.status === "published"
                          ? "default"
                          : p.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(post.queue_id || post.queue_priority) && (
            <>
              <Separator />
              <div className="flex gap-6 text-sm">
                {post.queue_id && (
                  <div>
                    <span className="text-xs text-muted-foreground">Queue</span>
                    <p>{post.queue_id}</p>
                  </div>
                )}
                {post.queue_priority && (
                  <div>
                    <span className="text-xs text-muted-foreground">Priority</span>
                    <p>{post.queue_priority}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
