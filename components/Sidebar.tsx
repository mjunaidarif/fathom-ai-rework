"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Avatar } from "./ui";
import {
  IconHome,
  IconSearch,
  IconSparkle,
  IconPlaylist,
  IconLogo,
} from "./icons";

const NAV = [
  { href: "/", label: "Home", icon: IconHome, exact: true },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/ask", label: "Ask Fathom", icon: IconSparkle },
  { href: "/playlists", label: "Playlists", icon: IconPlaylist },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, meetings, refresh } = useStore();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-[248px] shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--surface)] border-r border-[var(--border)]">
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <IconLogo />
        <span className="font-bold text-[17px] tracking-tight">Fathom</span>
        <span className="chip ml-auto !text-[10px] !py-0.5">rebuild</span>
      </div>

      <nav className="px-3 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-[14px] font-medium transition-colors"
              style={
                active
                  ? { background: "var(--accent-soft)", color: "var(--accent)" }
                  : { color: "var(--text-2)" }
              }
            >
              <Icon width={19} height={19} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-3">
        <Link href="/record" className="btn btn-primary w-full justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-white/90" /> New recording
        </Link>
      </div>

      <div className="px-5 mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        Library
      </div>
      <div className="px-3 flex-1 overflow-y-auto scroll-thin flex flex-col gap-0.5">
        {meetings.map((m) => (
          <Link
            key={m.id}
            href={`/meeting/${m.id}`}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-[9px] text-[13px] transition-colors hover:bg-[var(--surface-2)]"
            style={
              isActive(`/meeting/${m.id}`)
                ? { background: "var(--surface-2)", color: "var(--text)" }
                : { color: "var(--text-2)" }
            }
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: `hsl(${m.thumbnailHue} 65% 58%)` }}
            />
            <span className="truncate">{m.title}</span>
          </Link>
        ))}
      </div>

      <div className="p-3 border-t border-[var(--border)] flex items-center gap-2.5">
        <Avatar name={currentUser.name} color={currentUser.avatarColor} size={30} />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold truncate">{currentUser.name}</div>
          <div className="text-[11px] text-[var(--text-3)] truncate">Free plan</div>
        </div>
        <button
          onClick={() => void refresh()}
          title="Reload from the database"
          className="ml-auto text-[11px] text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
        >
          refresh
        </button>
      </div>
    </aside>
  );
}
