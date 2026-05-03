import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { useStore, projectProgress, projectStatus } from "@/lib/store";
import { TrendingUp, Users, FolderKanban, CheckCircle2, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: () => (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ),
});

// Wrap with layout via outlet trick: AppLayout renders Outlet, but here we want index inside layout.
// Simpler: render layout shell directly here.

function Dashboard() {
  const leads = useStore((s) => s.leads);
  const projects = useStore((s) => s.projects);

  const activeLeads = leads.filter((l) => l.stage !== "fechado").length;
  const closed = leads.filter((l) => l.stage === "fechado").length;
  const conversion = leads.length ? Math.round((closed / leads.length) * 100) : 0;
  const inProgress = projects.filter((p) => projectProgress(p) < 100).length;
  const completed = projects.filter((p) => projectProgress(p) === 100).length;

  const metrics = [
    { label: "Leads ativos", value: activeLeads, icon: Users, trend: "+12%" },
    { label: "Taxa de conversão", value: `${conversion}%`, icon: TrendingUp, trend: "+3%" },
    { label: "Projetos em andamento", value: inProgress, icon: FolderKanban, trend: "" },
    { label: "Projetos concluídos", value: completed, icon: CheckCircle2, trend: "" },
  ];

  // funnel by stage
  const stages = ["novo", "qualificacao", "contato", "proposta", "negociacao", "fechado"] as const;
  const stageLabels: Record<string, string> = {
    novo: "Novo", qualificacao: "Qualificação", contato: "Contato",
    proposta: "Proposta", negociacao: "Negociação", fechado: "Fechado",
  };
  const max = Math.max(...stages.map((s) => leads.filter((l) => l.stage === s).length), 1);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader title="Visão geral" subtitle="Acompanhe o desempenho da sua assessoria em tempo real." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-card border border-border rounded-xl p-5 animate-fade-in hover:border-primary/30 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent-foreground" />
                </div>
                {m.trend && (
                  <span className="text-xs font-medium text-success flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> {m.trend}
                  </span>
                )}
              </div>
              <div className="text-2xl font-semibold tracking-tight">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Funil de vendas</h2>
              <p className="text-xs text-muted-foreground">Distribuição de leads por etapa</p>
            </div>
            <Link to="/leads" className="text-xs text-primary hover:underline">Ver leads →</Link>
          </div>
          <div className="space-y-4">
            {stages.map((s) => {
              const count = leads.filter((l) => l.stage === s).length;
              const pct = (count / max) * 100;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{stageLabels[s]}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Projetos</h2>
              <p className="text-xs text-muted-foreground">Status e progresso</p>
            </div>
            <Link to="/projetos" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-5">
            {projects.slice(0, 4).map((p) => {
              const prog = projectProgress(p);
              const st = projectStatus(p);
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <span className="text-xs text-muted-foreground tabular-nums ml-2">{prog}%</span>
                  </div>
                  <ProgressBar value={prog} status={st} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
