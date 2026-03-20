import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Post } from "postproxy-sdk";
import { getPlatformLabel } from "@/lib/platforms";

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

export function PostCard({
  post,
  clientId,
}: {
  post: Post;
  clientId: string;
}) {
  return (
    <Link
      href={`/clients/${clientId}/posts/${post.id}`}
      className="block transition-shadow hover:ring-2 hover:ring-foreground/15 rounded-xl"
    >
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            {post.platforms?.map((p) => (
              <span
                key={p.platform}
                className="font-medium text-foreground"
                title={p.status}
              >
                {getPlatformLabel(p.platform)}
              </span>
            ))}
            {post.scheduled_at && (
              <>
                <span className="text-muted-foreground/40">&middot;</span>
                <span>
                  {new Date(post.scheduled_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}
          </CardTitle>
          <CardAction>
            <Badge variant={STATUS_VARIANTS[post.status] ?? "secondary"}>
              {STATUS_LABELS[post.status] ?? post.status}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent>
          <p className="text-sm whitespace-pre-wrap line-clamp-3 leading-relaxed">
            {post.body}
          </p>

          {post.media?.length > 0 && (
            <div className="flex gap-2 mt-3">
              {post.media.map((m) => (
                <div
                  key={m.id}
                  className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden ring-1 ring-foreground/5"
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
        </CardContent>
      </Card>
    </Link>
  );
}
