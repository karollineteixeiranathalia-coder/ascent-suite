import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/equipe")({
  component: () => (
    <AppLayout>
      <EquipePage />
    </AppLayout>
  ),
});

function EquipePage() {
  const team = useStore((s) => s.team);
  const projects = useStore((s) => s.projects);

  const stats = team.map((u) => {
    const tasks = projects.flatMap((p) => p.tasks.filter((t) => t.assignee === u.id));
    return {
      ...u,
      total: tasks.length,
      ativas: tasks.filter((t) => t.status !== "done").length,
      concluidas: tasks.filter((t) => t.status === "done").length,
      projetos: new Set(projects.filter((p) => p.tasks.some((t) => t.assignee === u.id)).map((p) => p.id)).size,
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader title="Equipe" subtitle="Membros, carga de trabalho e produtividade." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((u) => (
          <div key={u.id} className="bg-card border border-border rounded-xl p-5 animate-fade-in hover:border-primary/30 transition">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={u.initials} size={44} />
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.projetos} projetos</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Ativas" value={u.ativas} />
              <Stat label="Feitas" value={u.concluidas} />
              <Stat label="Total" value={u.total} />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                <span>Conclusão</span>
                <span className="tabular-nums">{u.total ? Math.round((u.concluidas / u.total) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-[width] duration-700" style={{ width: `${u.total ? (u.concluidas / u.total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-secondary/50 rounded-lg py-2">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
