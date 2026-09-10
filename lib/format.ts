import type { Platform } from "./types";

export function fmtClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - d;
  const day = 86_400_000;
  if (diff < day && new Date(iso).getDate() === new Date(now).getDate()) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return fmtDate(iso);
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  zoom: "Zoom",
  meet: "Google Meet",
  teams: "Microsoft Teams",
};

export function platformColor(p: Platform): string {
  return p === "zoom" ? "#2d8cff" : p === "meet" ? "#00897b" : "#5b5fc7";
}
