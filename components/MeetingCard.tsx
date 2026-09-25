import Link from "next/link";
import type { Meeting } from "@/lib/types";
import { fmtDuration, fmtRelative, fmtTime } from "@/lib/format";
import { AvatarStack, PlatformBadge, Tag, Thumbnail } from "./ui";
import { IconCheck, IconStar, IconTrash } from "./icons";

export function MeetingCard({ m, onDelete }: { m: Meeting; onDelete?: (id: string) => void }) {
  const openItems = m.actionItems.filter((a) => !a.done).length;
  return (
    <div className="relative group">
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(m.id);
          }}
          title="Delete meeting"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-lg grid place-items-center bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-3)] opacity-0 group-hover:opacity-100 hover:text-[var(--red)] hover:border-[var(--red)] transition-all"
        >
          <IconTrash width={15} height={15} />
        </button>
      )}
      <Link
        href={`/meeting/${m.id}`}
        className="card p-3 flex gap-4 hover:shadow-[var(--shadow-md)] transition-shadow block"
      >
      <Thumbnail
        hue={m.thumbnailHue}
        duration={fmtDuration(m.durationS)}
        platform={m.platform}
        className="w-[168px] h-[104px] shrink-0"
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-2">
          <h3 className="font-semibold text-[15px] leading-snug group-hover:text-[var(--accent)] transition-colors truncate">
            {m.title}
          </h3>
          {m.isTeamShared && <span className="chip shrink-0">Team</span>}
        </div>
        <div className="mt-1 flex items-center gap-2.5 text-[12.5px] text-[var(--text-3)]">
          <span>{fmtRelative(m.startedAt)}</span>
          <span>·</span>
          <span>{fmtTime(m.startedAt)}</span>
          <PlatformBadge platform={m.platform} />
        </div>
        <p className="mt-1.5 text-[13px] text-[var(--text-2)] line-clamp-2">{m.recap}</p>
        <div className="mt-auto pt-2 flex items-center gap-3">
          <AvatarStack attendees={m.attendees} />
          <div className="ml-auto flex items-center gap-3 text-[12px] text-[var(--text-3)]">
            {m.highlights.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <IconStar width={14} height={14} /> {m.highlights.length}
              </span>
            )}
            {openItems > 0 && (
              <span className="inline-flex items-center gap-1">
                <IconCheck width={14} height={14} /> {openItems} open
              </span>
            )}
            {m.tags[0] && <Tag>{m.tags[0]}</Tag>}
          </div>
        </div>
      </div>
      </Link>
    </div>
  );
}
