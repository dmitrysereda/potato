"use client";

import { Button } from "@/components/ui/button";
import { deletePost, publishDraft } from "@/actions/posts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostStatus } from "postproxy-sdk";

export function PostActions({
  clientId,
  postId,
  status,
}: {
  clientId: string;
  postId: string;
  status: PostStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <>
      {status === "draft" && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await publishDraft(clientId, postId);
            setLoading(false);
          }}
        >
          {loading ? "Publishing..." : "Publish"}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={loading}
        onClick={async () => {
          if (confirm("Delete this post?")) {
            setLoading(true);
            await deletePost(clientId, postId);
            router.push(`/clients/${clientId}/posts`);
          }
        }}
      >
        Delete
      </Button>
    </>
  );
}
