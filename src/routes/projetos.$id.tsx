import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { ProgressBar } from "@/components/ProgressBar";
import { Avatar } from "@/components/Avatar";
import {
  Priority, TASK_STATUSES, Task, TaskStatus,
  projectProgress, projectStatus, store, useStore,
} from "@/lib/store";
import { useState } from "react";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { Dialog } from "./leads";
import { toast } from "sonner";

export const Route = createFileRoute("/projetos/$id")({
  component: () => (
    <AppLayout>
      <ProjectDetail />
    </AppLayout>
  ),
});

function ProjectDetail() {
  const { id } = useParams({ from: "/projetos/$id" });
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const team = useStore((s) => s.team);
  const [dragId, setDragId] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState(false);

  if (!project) return <div className="p-8">Projeto não encontrado.</div>;

  const prog = projectProgress(project);
  const st = projectStatus(project);

  const onDrop = (status: TaskStatus) => {
    if (dragId) {
      store.moveTask(project.id, dragId, status);
      toast.success("Tarefa atualizada");
    }
    setDragId(null);
  };

  const workload = team.map((u) => ({
    ...u,
    count: project.tasks.filter((t) => t.assignee === u.id && t.status !== "done").length,
  }));

  return (
    <div className="p-8 max-w-[1500px] mx-auto">
      <Link to="/projetos" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 transition">
        <ArrowLeft className="w-3 h-3" /> Voltar para projetos
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{project.client} · {project.description}</p>
        </div>
        <button onClick={() => setOpenTask(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> Nova tarefa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progresso</span>
            <span className="text-2xl font-semibold tabular-nums">{prog}%</span>
          </div>
          <ProgressBar value={prog} status={st} />
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Início: {new Date(project.startDate).toLocaleDateString("pt-BR")}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Prazo: {new Date(project.dueDate).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Carga da equipe</div>
          <div className="space-y-2.5">
            {workload.map((u) => {
              const max = Math.max(...workload.map((w) => w.count), 1);
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar initials={u.initials} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>{u.name}</span>
                      <span className="text-muted-foreground tabular-nums">{u.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-[width] duration-700" style={{ width: `${(u.count / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TASK_STATUSES.map((col) => {
          const items = project.tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              className="bg-secondary/40 rounded-xl p-3 min-h-[300px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
                <span className="text-[10px] bg-background border border-border rounded-full px-1.5 py-0.5 tabular-nums">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <TaskCard key={t.id} task={t} onDragStart={() => setDragId(t.id)} onDragEnd={() => setDragId(null)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {openTask && <NewTaskDialog projectId={project.id} onClose={() => setOpenTask(false)} />}
    </div>
  );
}

function TaskCard({ task, onDragStart, onDragEnd }: { task: Task; onDragStart: () => void; onDragEnd: () => void }) {
  const team = useStore((s) => s.team);
  const user = team.find((u) => u.id === task.assignee);
  const prio = task.priority === "alta" ? "text-danger" : task.priority === "media" ? "text-warning" : "text-muted-foreground";
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-sm transition animate-fade-in"
    >
      <div className="text-sm font-medium mb-2">{task.title}</div>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${prio}`}>{task.priority}</span>
        {user && <Avatar initials={user.initials} size={22} />}
      </div>
    </div>
  );
}

function NewTaskDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const team = useStore((s) => s.team);
  const [form, setForm] = useState({ title: "", priority: "media" as Priority, status: "todo" as TaskStatus, assignee: team[0]?.id ?? "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Informe o título");
    store.addTask(projectId, form);
    toast.success("Tarefa criada");
    onClose();
  };
  const inp = "w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 transition";
  return (
    <Dialog onClose={onClose} title="Nova tarefa">
      <form onSubmit={submit} className="space-y-3">
        <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Título</span><input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</span>
            <select className={inp} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
              {TASK_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Prioridade</span>
            <select className={inp} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option>
            </select>
          </label>
          <label className="block"><span className="text-xs font-medium text-muted-foreground mb-1.5 block">Responsável</span>
            <select className={inp} value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
              {team.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg hover:bg-secondary transition">Cancelar</button>
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">Criar tarefa</button>
        </div>
      </form>
    </Dialog>
  );
}
