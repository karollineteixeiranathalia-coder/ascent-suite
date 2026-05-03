import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { Avatar } from "@/components/Avatar";
import { projectProgress, projectStatus, store, useStore } from "@/lib/store";
import { Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { Dialog } from "./leads";
import { toast } from "sonner";

export const Route = createFileRoute("/projetos")({
  component: () => (
    <AppLayout>
      <ProjectsPage />
    </AppLayout>
  ),
});

function ProjectsPage() {
  const projects = useStore((s) => s.projects);
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Projetos"
        subtitle="Acompanhe a execução e o progresso de cada cliente."
        actions={
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Novo projeto
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => {
          const prog = projectProgress(p);
          const st = projectStatus(p);
          const statusLabel = st === "ok" ? "Em dia" : st === "risk" ? "Em risco" : "Atrasado";
          const statusColor = st === "ok" ? "text-success" : st === "risk" ? "text-warning" : "text-danger";
          const statusDot = st === "ok" ? "bg-success" : st === "risk" ? "bg-warning" : "bg-danger";

          return (
            <Link
              key={p.id}
              to="/projetos/$id"
              params={{ id: p.id }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all duration-200 animate-fade-in block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.client}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                  {statusLabel}
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">{p.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="tabular-nums">{prog}% concluído</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.dueDate).toLocaleDateString("pt-BR")}</span>
              </div>
              <ProgressBar value={prog} status={st} />
              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  {Array.from(new Set(p.tasks.map((t) => t.assignee))).slice(0, 4).map((aid) => {
                    const u = store.getState().team.find((t) => t.id === aid);
                    return u ? <Avatar key={aid} initials={u.initials} /> : null;
                  })}
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{p.tasks.length} tarefas</span>
              </div>
            </Link>
          );
        })}
      </div>

      {open && <NewProjectDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", client: "", description: "",
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Informe o nome do projeto");
    store.addProject({
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      dueDate: new Date(form.dueDate).toISOString(),
    });
    toast.success("Projeto criado");
    onClose();
  };
  const inp = "w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 transition";
  return (
    <Dialog onClose={onClose} title="Novo projeto">
      <form onSubmit={submit} className="space-y-3">
        <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome</span><input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Cliente</span><input className={inp} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></label>
        <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Descrição</span><textarea rows={3} className={inp} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Início</span><input type="date" className={inp} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
          <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Prazo</span><input type="date" className={inp} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg hover:bg-secondary transition">Cancelar</button>
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">Criar projeto</button>
        </div>
      </form>
    </Dialog>
  );
}
