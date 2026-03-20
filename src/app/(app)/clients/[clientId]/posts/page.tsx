export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { getPosts } from "@/actions/posts";
import { PostCard } from "@/components/post-card";

const STATUSES = [
  { value: undefined, label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "failed", label: "Failed" },
];

export default async function PostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { clientId } = await params;
  const { status, page } = await searchParams;

  const client = await getClient(clientId);
  if (!client) notFound();

  const currentStatus = status;
  const currentPage = page ? parseInt(page) : 1;

  const result = await getPosts(client.postproxy_profile_group_id, {
    status: currentStatus,
    page: currentPage,
  });

  const totalPages = Math.ceil(result.total / result.per_page);

  return (
    <div className="p-8">
      <div className="flex items-center gap-1.5 mb-6">
        {STATUSES.map((s) => {
          const isActive = currentStatus === s.value;
          const href = s.value
            ? `/clients/${clientId}/posts?status=${s.value}`
            : `/clients/${clientId}/posts`;
          return (
            <Link
              key={s.label}
              href={href}
              className={`px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {result.data.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground text-sm">
          No posts found
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {result.data
            .filter((post, i, arr) => arr.findIndex((p) => p.id === post.id) === i)
            .map((post) => (
              <PostCard key={post.id} post={post} clientId={clientId} />
            ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {currentPage > 1 && (
            <Link
              href={`/clients/${clientId}/posts?${status ? `status=${status}&` : ""}page=${currentPage - 1}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground/60">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/clients/${clientId}/posts?${status ? `status=${status}&` : ""}page=${currentPage + 1}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
