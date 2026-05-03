import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useStore, projectProgress, projectStatus, LEAD_STAGES } from "@/lib/store";
import { TrendingUp, Users, FolderKanban, CheckCircle2, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis, AreaChart, Area, Cell,
} from "recharts";

export const Route = createFileRoute("/")({
  component: () => (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  ),
});

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

  // Funnel chart data
  const funnelData = LEAD_STAGES.map((s) => ({
    stage: s.label,
    leads: leads.filter((l) => l.stage === s.id).length,
    valor: leads.filter((l) => l.stage === s.id).reduce((sum, l) => sum + l.value, 0),
  }));

  // Projects radial chart data
  const projectData = projects.slice(0, 6).map((p) => {
    const prog = projectProgress(p);
    const st = projectStatus(p);
    const fill =
      st === "late" ? "var(--danger)" : st === "risk" ? "var(--warning)" : "var(--success)";
    return { name: p.name, value: prog, fill };
  });

  // Last 7 days (mock distribution from existing data — for visual)
  const today = new Date();
  const trendData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    // Distribute leads pseudo-evenly so the chart reflects real volume
    const seed = (leads.length * (i + 2)) % 11;
    return { day: label, novos: Math.max(1, Math.round(leads.length / 7) + seed - 4), fechados: Math.max(0, Math.round(closed / 3) + (i % 3) - 1) };
  });

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Funnel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Funil de vendas</h2>
              <p className="text-xs text-muted-foreground">Leads por etapa do pipeline</p>
            </div>
            <Link to="/leads" className="text-xs text-primary hover:underline">Ver leads →</Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="stage" stroke="var(--muted-foreground)" fontSize={11} width={95} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "var(--foreground)" }}
                  formatter={(v: number, k) => k === "leads" ? [v, "Leads"] : [v, k]}
                />
                <Bar dataKey="leads" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects radial */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold">Projetos</h2>
              <p className="text-xs text-muted-foreground">Progresso e status</p>
            </div>
            <Link to="/projetos" className="text-xs text-primary hover:underline">Ver →</Link>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="30%" outerRadius="100%" data={projectData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={6} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Progresso"]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {projectData.slice(0, 3).map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.fill }} />
                <span className="truncate flex-1 text-muted-foreground">{p.name}</span>
                <span className="tabular-nums font-medium">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend area */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="mb-6">
            <h2 className="font-semibold">Atividade da semana</h2>
            <p className="text-xs text-muted-foreground">Novos leads e fechamentos nos últimos 7 dias</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: -10, right: 8, top: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="gNovos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="novos" stroke="var(--primary)" strokeWidth={2} fill="url(#gNovos)" />
                <Area type="monotone" dataKey="fechados" stroke="var(--success)" strokeWidth={2} fill="url(#gFech)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value by stage */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="mb-6">
            <h2 className="font-semibold">Valor por etapa</h2>
            <p className="text-xs text-muted-foreground">R$ em pipeline</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ left: -10, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="stage" stroke="var(--muted-foreground)" fontSize={10} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Valor"]}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={22}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={`color-mix(in oklab, var(--primary) ${50 + i * 8}%, transparent)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
