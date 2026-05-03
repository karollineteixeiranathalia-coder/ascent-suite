export function ProgressBar({ value, status = "ok" }: { value: number; status?: "ok" | "risk" | "late" }) {
  const color =
    status === "late" ? "bg-danger" : status === "risk" ? "bg-warning" : "bg-success";
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full ${color} animate-progress transition-[width] duration-700 ease-out rounded-full`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
