import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useStore, projectProgress } from "@/lib/store";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/relatorios")({
  component: () => (
    <AppLayout>
      <RelatoriosPage />
    </AppLayout>
  ),
});

function RelatoriosPage() {
  const leads = useStore((s) => s.leads);
  const projects = useStore((s) => s.projects);

  const tempData = ["quente", "morno", "frio"].map((t) => ({
    name: t.charAt(0).toUpperCase() + t.slice(1),
    value: leads.filter((l) => l.temperature === t).length,
  }));

  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  const totalPipeline = leads.reduce((s, l) => s + l.value, 0);
  const closed = leads.filter((l) => l.stage === "fechado");
  const closedValue = closed.reduce((s, l) => s + l.value, 0);
  const ticketMedio = closed.length ? closedValue / closed.length : 0;

  const projectStatusData = [
    { name: "Em dia", value: projects.filter((p) => projectProgress(p) < 100).length, fill: "var(--success)" },
    { name: "Concluídos", value: projects.filter((p) => projectProgress(p) === 100).length, fill: "var(--primary)" },
  ];

  const tempColors = ["var(--hot)", "var(--warm)", "var(--cold)"];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader title="Relatórios" subtitle="Análises detalhadas do seu desempenho." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Pipeline total" value={`R$ ${(totalPipeline / 1000).toFixed(0)}k`} />
        <Kpi label="Receita fechada" value={`R$ ${(closedValue / 1000).toFixed(0)}k`} />
        <Kpi label="Ticket médio" value={`R$ ${(ticketMedio / 1000).toFixed(1)}k`} />
        <Kpi label="Total de leads" value={leads.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Leads por temperatura">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tempData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {tempData.map((_, i) => <Cell key={i} fill={tempColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs">
            {tempData.map((t, i) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: tempColors[i] }} />
                <span className="text-muted-foreground">{t.name}: <span className="text-foreground font-medium">{t.value}</span></span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Leads por origem">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Status dos projetos">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={projectStatusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label={(e) => `${e.name}: ${e.value}`} fontSize={11}>
                {projectStatusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tracking-tight mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
