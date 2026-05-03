export function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-semibold ring-2 ring-background"
      style={{ width: size, height: size }}
      title={initials}
    >
      {initials}
    </div>
  );
}
