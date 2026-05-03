import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useStore, projectProgress, projectStatus } from "@/lib/store";
import { Bell, AlertTriangle, CheckCircle2, Clock, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/notificacoes")({
  component: () => (
    <AppLayout>
      <NotificacoesPage />
    </AppLayout>
  ),
});

function NotificacoesPage() {
  const leads = useStore((s) => s.leads);
  const projects = useStore((s) => s.projects);
  const [read, setRead] = useState<Set<string>>(new Set());

  const items = useMemo(() => {
    const list: { id: string; type: "warning" | "info" | "success"; icon: any; title: string; desc: string; time: string }[] = [];
    projects.forEach((p) => {
      const st = projectStatus(p);
      if (st === "late") list.push({ id: `late-${p.id}`, type: "warning", icon: AlertTriangle, title: `${p.name} está atrasado`, desc: `Prazo: ${new Date(p.dueDate).toLocaleDateString("pt-BR")}`, time: "há 1 hora" });
      else if (st === "risk") list.push({ id: `risk-${p.id}`, type: "warning", icon: Clock, title: `${p.name} em risco`, desc: `Progresso ${projectProgress(p)}% — atenção ao prazo`, time: "há 3 horas" });
      if (projectProgress(p) === 100) list.push({ id: `done-${p.id}`, type: "success", icon: CheckCircle2, title: `${p.name} concluído`, desc: "Todas as tarefas foram finalizadas", time: "há 1 dia" });
    });
    leads.filter((l) => l.temperature === "quente" && l.stage !== "fechado").slice(0, 3).forEach((l) =>
      list.push({ id: `hot-${l.id}`, type: "info", icon: UserPlus, title: `Lead quente: ${l.name}`, desc: `${l.company} — R$ ${l.value.toLocaleString("pt-BR")}`, time: "há 30 min" })
    );
    return list;
  }, [leads, projects]);

  const unread = items.filter((i) => !read.has(i.id)).length;
  const colors = { warning: "text-warning bg-warning/10", info: "text-primary bg-primary/10", success: "text-success bg-success/10" };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Notificações"
        subtitle={`${unread} não lidas`}
        actions={
          <button onClick={() => setRead(new Set(items.map((i) => i.id)))} className="text-sm text-primary hover:underline">Marcar todas como lidas</button>
        }
      />

      <div className="bg-card border border-border rounded-xl divide-y divide-border animate-fade-in">
        {items.map((n) => {
          const Icon = n.icon;
          const isRead = read.has(n.id);
          return (
            <button
              key={n.id}
              onClick={() => setRead(new Set([...read, n.id]))}
              className={`w-full text-left flex gap-3 p-4 hover:bg-secondary/40 transition ${isRead ? "opacity-60" : ""}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[n.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{n.time}</div>
              </div>
            </button>
          );
        })}
        {items.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Nenhuma notificação no momento.
          </div>
        )}
      </div>
    </div>
  );
}
