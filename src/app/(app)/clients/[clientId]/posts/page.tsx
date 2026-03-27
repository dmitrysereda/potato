export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutList, CalendarDays } from "lucide-react";
import { getClient } from "@/actions/clients";
import { getPosts } from "@/actions/posts";
import { PostCard } from "@/components/post-card";
import { PostsCalendar } from "@/components/posts-calendar";

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
  searchParams: Promise<{
    status?: string;
    page?: string;
    view?: string;
    year?: string;
    month?: string;
  }>;
}) {
  const { clientId } = await params;
  const { status, page, view, year: yearParam, month: monthParam } =
    await searchParams;

  const client = await getClient(clientId);
  if (!client) notFound();

  const isCalendar = view === "calendar";
  const currentStatus = status;
  const currentPage = page ? parseInt(page) : 1;

  const now = new Date();
  const calYear = yearParam ? parseInt(yearParam) : now.getFullYear();
  const calMonth = monthParam ? parseInt(monthParam) : now.getMonth() + 1;

  const result = await getPosts(client.postproxy_profile_group_id, {
    status: currentStatus,
    page: isCalendar ? 1 : currentPage,
    perPage: isCalendar ? 100 : 20,
  });

  const totalPages = Math.ceil(result.total / result.per_page);

  const buildCalHref = (s?: string) => {
    const base = `/clients/${clientId}/posts?view=calendar&year=${calYear}&month=${calMonth}`;
    return s ? `${base}&status=${s}` : base;
  };

  const buildListHref = (s?: string) =>
    s ? `/clients/${clientId}/posts?status=${s}` : `/clients/${clientId}/posts`;

  const calToggleHref = buildCalHref(currentStatus);
  const listToggleHref = buildListHref(currentStatus);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        {/* Status filters */}
        <div className="flex items-center gap-1.5">
          {STATUSES.map((s) => {
            const isActive = currentStatus === s.value;
            const href = isCalendar
              ? buildCalHref(s.value)
              : buildListHref(s.value);
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

        {/* View toggle */}
        <div className="flex items-center gap-0.5 bg-muted p-1 rounded-lg">
          <Link
            href={listToggleHref}
            className={`p-1.5 rounded-md transition-all ${
              !isCalendar
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List view"
          >
            <LayoutList size={15} />
          </Link>
          <Link
            href={calToggleHref}
            className={`p-1.5 rounded-md transition-all ${
              isCalendar
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Calendar view"
          >
            <CalendarDays size={15} />
          </Link>
        </div>
      </div>

      {isCalendar ? (
        <PostsCalendar
          posts={result.data}
          clientId={clientId}
          year={calYear}
          month={calMonth}
          status={currentStatus}
        />
      ) : (
        <>
          {result.data.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground text-sm">
              No posts found
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {result.data
                .filter(
                  (post, i, arr) =>
                    arr.findIndex((p) => p.id === post.id) === i
                )
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
        </>
      )}
    </div>
  );
}
