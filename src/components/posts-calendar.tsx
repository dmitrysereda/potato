import Link from "next/link";
import type { Post } from "postproxy-sdk";

const STATUS_DOT: Record<string, string> = {
  processed: "bg-primary",
  scheduled: "bg-warm-amber",
  draft: "bg-muted-foreground/30",
  pending: "bg-muted-foreground/30",
  processing: "bg-muted-foreground/30",
  media_processing_failed: "bg-destructive",
};

const STATUS_LABEL: Record<string, string> = {
  processed: "Published",
  scheduled: "Scheduled",
  draft: "Draft",
  pending: "Pending",
  processing: "Processing",
  media_processing_failed: "Failed",
};

const PLATFORM_ABBR: Record<string, string> = {
  facebook: "FB",
  instagram: "IG",
  twitter: "X",
  linkedin: "LI",
  tiktok: "TT",
  youtube: "YT",
  threads: "TH",
  pinterest: "PI",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PostsCalendar({
  posts,
  clientId,
  year,
  month,
  status,
}: {
  posts: Post[];
  clientId: string;
  year: number;
  month: number; // 1-indexed
  status?: string;
}) {
  const jsMonth = month - 1;
  const firstDay = new Date(year, jsMonth, 1);
  const daysInMonth = new Date(year, jsMonth + 1, 0).getDate();
  const startDow = firstDay.getDay();

  // Group posts by day of this month
  const postsByDay: Record<number, Post[]> = {};
  for (const post of posts) {
    const date = post.scheduled_at
      ? new Date(post.scheduled_at)
      : new Date(post.created_at);
    if (date.getFullYear() === year && date.getMonth() === jsMonth) {
      const d = date.getDate();
      if (!postsByDay[d]) postsByDay[d] = [];
      postsByDay[d].push(post);
    }
  }

  // Sort each day's posts by time
  for (const d of Object.keys(postsByDay)) {
    postsByDay[Number(d)].sort((a, b) => {
      const ta = a.scheduled_at
        ? new Date(a.scheduled_at).getTime()
        : new Date(a.created_at).getTime();
      const tb = b.scheduled_at
        ? new Date(b.scheduled_at).getTime()
        : new Date(b.created_at).getTime();
      return ta - tb;
    });
  }

  // Calendar grid cells
  const cells: (number | null)[] = [
    ...Array<null>(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Today
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === jsMonth;
  const todayDate = today.getDate();

  // Nav hrefs
  const buildHref = (y: number, m: number) => {
    const base = `/clients/${clientId}/posts?view=calendar&year=${y}&month=${m}`;
    return status ? `${base}&status=${status}` : base;
  };
  const prevDate = new Date(year, jsMonth - 1, 1);
  const nextDate = new Date(year, jsMonth + 1, 1);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-xl">
          {MONTH_NAMES[jsMonth]} {year}
        </h2>
        <div className="flex items-center gap-0.5">
          <Link
            href={buildHref(prevDate.getFullYear(), prevDate.getMonth() + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Previous month"
          >
            ‹
          </Link>
          <Link
            href={buildHref(nextDate.getFullYear(), nextDate.getMonth() + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Next month"
          >
            ›
          </Link>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border mb-0">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground/50 tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="grid grid-cols-7"
        style={{ borderLeft: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}
      >
        {cells.map((day, i) => {
          const dayPosts = day ? (postsByDay[day] ?? []) : [];
          const isToday = isCurrentMonth && day === todayDate;
          const MAX_VISIBLE = 4;

          return (
            <div
              key={i}
              className={`min-h-28 p-2 border-r border-b border-border ${!day ? "bg-muted/20" : ""}`}
            >
              {day && (
                <>
                  <div
                    className={`text-xs mb-1.5 w-6 h-6 flex items-center justify-center rounded-full font-medium transition-colors ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </div>

                  <div className="space-y-0.5">
                    {dayPosts.slice(0, MAX_VISIBLE).map((post) => {
                      const dot =
                        STATUS_DOT[post.status] ?? "bg-muted-foreground/30";
                      const platforms = post.platforms
                        ?.slice(0, 2)
                        .map(
                          (p) =>
                            PLATFORM_ABBR[p.platform] ??
                            p.platform.slice(0, 2).toUpperCase()
                        )
                        .join("·");
                      const statusLabel =
                        STATUS_LABEL[post.status] ?? post.status;
                      const time = post.scheduled_at
                        ? new Date(post.scheduled_at).toLocaleTimeString(
                            undefined,
                            { hour: "numeric", minute: "2-digit" }
                          )
                        : null;

                      return (
                        <Link
                          key={post.id}
                          href={`/clients/${clientId}/posts/${post.id}`}
                          title={`${statusLabel}${platforms ? ` · ${platforms}` : ""}${time ? ` · ${time}` : ""}\n${post.body ?? ""}`}
                          className="flex items-center gap-1 group rounded px-1 py-0.5 hover:bg-muted transition-colors"
                        >
                          <span
                            className={`shrink-0 w-1.5 h-1.5 rounded-full ${dot}`}
                          />
                          {platforms && (
                            <span className="text-[10px] text-muted-foreground shrink-0 font-medium leading-none">
                              {platforms}
                            </span>
                          )}
                          <span className="text-[10px] truncate text-foreground/60 group-hover:text-foreground/90 transition-colors leading-none">
                            {post.body?.slice(0, 28) || "—"}
                          </span>
                        </Link>
                      );
                    })}

                    {dayPosts.length > MAX_VISIBLE && (
                      <div className="text-[10px] text-muted-foreground/60 px-1 pt-0.5">
                        +{dayPosts.length - MAX_VISIBLE} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {[
          { key: "processed", label: "Published" },
          { key: "scheduled", label: "Scheduled" },
          { key: "draft", label: "Draft" },
          { key: "media_processing_failed", label: "Failed" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${STATUS_DOT[key]}`}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
