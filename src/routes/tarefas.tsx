import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { useStore, store, TASK_STATUSES, TaskStatus, Priority } from "@/lib/store";
import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";

export const Route = createFileRoute("/tarefas")({
  component: () => (
    <AppLayout>
      <TarefasPage />
    </AppLayout>
  ),
});

function TarefasPage() {
  const projects = useStore((s) => s.projects);
  const team = useStore((s) => s.team);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | TaskStatus>("all");

  const all = useMemo(() => {
    return projects.flatMap((p) =>
      p.tasks.map((t) => ({ ...t, projectId: p.id, projectName: p.name, client: p.client }))
    );
  }, [projects]);

  const filtered = all.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (q && !`${t.title} ${t.projectName}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: all.length,
    todo: all.filter((t) => t.status === "todo").length,
    doing: all.filter((t) => t.status === "doing").length,
    review: all.filter((t) => t.status === "review").length,
    done: all.filter((t) => t.status === "done").length,
  };

  const prioColor = (p: Priority) =>
    p === "alta" ? "text-danger" : p === "media" ? "text-warning" : "text-muted-foreground";
  const statusBadge = (s: TaskStatus) => {
    const map: Record<TaskStatus, string> = {
      todo: "bg-muted text-muted-foreground",
      doing: "bg-accent text-accent-foreground",
      review: "bg-warning/15 text-warning",
      done: "bg-success/15 text-success",
    };
    return map[s];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader title="Tarefas" subtitle="Todas as tarefas dos seus projetos em uma só visão." />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar tarefa..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 transition"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <FilterBtn label={`Todas (${counts.all})`} active={filterStatus === "all"} onClick={() => setFilterStatus("all")} />
          {TASK_STATUSES.map((s) => (
            <FilterBtn key={s.id} label={`${s.label} (${counts[s.id]})`} active={filterStatus === s.id} onClick={() => setFilterStatus(s.id)} />
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="font-medium px-4 py-3 w-8"></th>
              <th className="font-medium px-2 py-3">Tarefa</th>
              <th className="font-medium px-2 py-3">Projeto</th>
              <th className="font-medium px-2 py-3">Status</th>
              <th className="font-medium px-2 py-3">Prioridade</th>
              <th className="font-medium px-2 py-3">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const u = team.find((m) => m.id === t.assignee);
              return (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => store.moveTask(t.projectId, t.id, t.status === "done" ? "todo" : "done")}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        t.status === "done" ? "bg-success border-success text-white" : "border-border hover:border-primary"
                      }`}
                    >
                      {t.status === "done" && <Check className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className={`px-2 py-3 ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</td>
                  <td className="px-2 py-3 text-muted-foreground">{t.projectName}</td>
                  <td className="px-2 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wider ${statusBadge(t.status)}`}>
                      {TASK_STATUSES.find((s) => s.id === t.status)?.label}
                    </span>
                  </td>
                  <td className={`px-2 py-3 text-xs uppercase tracking-wider font-semibold ${prioColor(t.priority)}`}>{t.priority}</td>
                  <td className="px-2 py-3">{u && <div className="flex items-center gap-2"><Avatar initials={u.initials} size={22} /><span className="text-xs">{u.name}</span></div>}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhuma tarefa encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {label}
    </button>
  );
}
