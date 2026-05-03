import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { Calendar as CalIcon, Clock, Phone } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/agenda")({
  component: () => (
    <AppLayout>
      <AgendaPage />
    </AppLayout>
  ),
});

function AgendaPage() {
  const leads = useStore((s) => s.leads);
  const projects = useStore((s) => s.projects);
  const team = useStore((s) => s.team);
  const [month, setMonth] = useState(() => new Date());

  const events = useMemo(() => {
    const list: { date: Date; type: "followup" | "task" | "deadline"; title: string; sub: string; assignee?: string }[] = [];
    leads.forEach((l) => {
      if (l.nextFollowUp) list.push({ date: new Date(l.nextFollowUp), type: "followup", title: `Follow-up: ${l.name}`, sub: l.company });
    });
    projects.forEach((p) => {
      list.push({ date: new Date(p.dueDate), type: "deadline", title: `Prazo: ${p.name}`, sub: p.client });
      p.tasks.forEach((t) => { if (t.dueDate) list.push({ date: new Date(t.dueDate), type: "task", title: t.title, sub: p.name, assignee: t.assignee }); });
    });
    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [leads, projects]);

  const upcoming = events.filter((e) => e.date.getTime() >= Date.now() - 86400000).slice(0, 8);

  // calendar grid
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const hasEvent = (d: number) => events.some((e) => e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear() && e.date.getDate() === d);

  const typeIcon = (t: string) => t === "followup" ? Phone : t === "task" ? Clock : CalIcon;
  const typeColor = (t: string) => t === "followup" ? "text-primary" : t === "task" ? "text-warning" : "text-danger";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader title="Agenda" subtitle="Compromissos, prazos e follow-ups." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold capitalize">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2>
            <div className="flex gap-1">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition">←</button>
              <button onClick={() => setMonth(new Date())} className="px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition">Hoje</button>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="px-3 py-1.5 text-xs rounded-md hover:bg-secondary transition">→</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              const isToday = d && new Date().toDateString() === new Date(month.getFullYear(), month.getMonth(), d).toDateString();
              const has = d ? hasEvent(d) : false;
              return (
                <div key={i} className={`aspect-square rounded-lg p-1.5 flex flex-col text-xs transition ${
                  d ? "hover:bg-secondary cursor-pointer" : ""
                } ${isToday ? "bg-accent text-accent-foreground font-semibold" : ""}`}>
                  {d && <>
                    <span className="tabular-nums">{d}</span>
                    {has && <span className="mt-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                  </>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Próximos eventos</h2>
          <div className="space-y-3">
            {upcoming.map((e, i) => {
              const Icon = typeIcon(e.type);
              const u = e.assignee ? team.find((m) => m.id === e.assignee) : null;
              return (
                <div key={i} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 ${typeColor(e.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{e.sub}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{e.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</div>
                  </div>
                  {u && <Avatar initials={u.initials} size={22} />}
                </div>
              );
            })}
            {upcoming.length === 0 && <div className="text-xs text-muted-foreground text-center py-8">Sem eventos agendados.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
