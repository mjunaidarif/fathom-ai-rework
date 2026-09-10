import type { Attendee, Platform } from "@/lib/types";
import { PLATFORM_LABEL, platformColor } from "@/lib/format";

export function Avatar({
  name,
  color,
  size = 28,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
      }}
      title={name}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ attendees, max = 4 }: { attendees: Attendee[]; max?: number }) {
  const shown = attendees.slice(0, max);
  const extra = attendees.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((a) => (
          <span key={a.speakerLabel} className="ring-2 ring-[var(--surface)] rounded-full">
            <Avatar name={a.name} color={a.color} size={26} />
          </span>
        ))}
      </div>
      {extra > 0 && (
        <span
          className="ml-1 inline-flex items-center justify-center rounded-full text-[11px] font-semibold text-[var(--text-2)] bg-[var(--surface-2)] ring-2 ring-[var(--surface)]"
          style={{ width: 26, height: 26 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

export function Thumbnail({
  hue,
  duration,
  className = "",
  platform,
}: {
  hue: number;
  duration?: string;
  className?: string;
  platform?: Platform;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 40) % 360} 74% 52%))`,
      }}
    >
      <div className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #fff 0, transparent 45%)" }} />
      {platform && (
        <span className="absolute top-2 left-2">
          <PlatformBadge platform={platform} onDark />
        </span>
      )}
      {duration && (
        <span className="absolute bottom-2 right-2 text-[11px] font-semibold text-white/95 bg-black/35 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
          {duration}
        </span>
      )}
    </div>
  );
}

export function PlatformBadge({ platform, onDark = false }: { platform: Platform; onDark?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={
        onDark
          ? { background: "rgba(255,255,255,0.9)", color: platformColor(platform) }
          : { background: "var(--surface-2)", color: platformColor(platform) }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: platformColor(platform) }} />
      {PLATFORM_LABEL[platform]}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="chip">{children}</span>;
}
