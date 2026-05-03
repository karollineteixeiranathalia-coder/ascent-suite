// Simple in-memory store with React subscription for v1.
// Easy to swap for Lovable Cloud later.
import { useSyncExternalStore } from "react";

export type LeadStage = "novo" | "qualificacao" | "contato" | "proposta" | "negociacao" | "fechado";
export type LeadTemp = "quente" | "morno" | "frio";

export interface Interaction {
  id: string;
  date: string;
  type: "ligacao" | "email" | "reuniao" | "nota";
  note: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  interest: string;
  value: number;
  stage: LeadStage;
  temperature: LeadTemp;
  createdAt: string;
  nextFollowUp?: string;
  interactions: Interaction[];
}

export type TaskStatus = "todo" | "doing" | "review" | "done";
export type Priority = "baixa" | "media" | "alta";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  startDate: string;
  dueDate: string;
  tasks: Task[];
}

interface State {
  leads: Lead[];
  projects: Project[];
  team: { id: string; name: string; initials: string }[];
}

export const LEAD_STAGES: { id: LeadStage; label: string }[] = [
  { id: "novo", label: "Novo Lead" },
  { id: "qualificacao", label: "Qualificação" },
  { id: "contato", label: "Contato" },
  { id: "proposta", label: "Proposta" },
  { id: "negociacao", label: "Negociação" },
  { id: "fechado", label: "Fechado" },
];

export const TASK_STATUSES: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "A Fazer" },
  { id: "doing", label: "Em Progresso" },
  { id: "review", label: "Revisão" },
  { id: "done", label: "Concluído" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const team = [
  { id: "u1", name: "Ana Silva", initials: "AS" },
  { id: "u2", name: "Bruno Costa", initials: "BC" },
  { id: "u3", name: "Clara Dias", initials: "CD" },
  { id: "u4", name: "Diego Lima", initials: "DL" },
];

let state: State = {
  team,
  leads: [
    { id: uid(), name: "Marcelo Andrade", company: "Andrade Holdings", email: "marcelo@andrade.com", phone: "+55 11 99999-1111", source: "Indicação", interest: "Consultoria estratégica", value: 85000, stage: "negociacao", temperature: "quente", createdAt: new Date().toISOString(), nextFollowUp: new Date(Date.now()+86400000).toISOString(), interactions: [{ id: uid(), date: new Date().toISOString(), type: "reuniao", note: "Apresentação inicial realizada" }] },
    { id: uid(), name: "Renata Souza", company: "Souza & Cia", email: "renata@souzacia.com", phone: "+55 21 98888-2222", source: "LinkedIn", interest: "Reestruturação", value: 42000, stage: "proposta", temperature: "quente", createdAt: new Date().toISOString(), interactions: [] },
    { id: uid(), name: "Felipe Moreira", company: "FM Tech", email: "felipe@fmtech.io", phone: "+55 11 97777-3333", source: "Website", interest: "Auditoria", value: 28000, stage: "contato", temperature: "morno", createdAt: new Date().toISOString(), interactions: [] },
    { id: uid(), name: "Juliana Prado", company: "Prado Investimentos", email: "ju@prado.inv", phone: "+55 11 96666-4444", source: "Evento", interest: "M&A", value: 150000, stage: "qualificacao", temperature: "quente", createdAt: new Date().toISOString(), interactions: [] },
    { id: uid(), name: "Carlos Mendes", company: "Mendes Group", email: "carlos@mendes.com", phone: "+55 31 95555-5555", source: "Indicação", interest: "Consultoria", value: 18000, stage: "novo", temperature: "frio", createdAt: new Date().toISOString(), interactions: [] },
    { id: uid(), name: "Patrícia Lopes", company: "PL Advogados", email: "patricia@pl.adv", phone: "+55 11 94444-6666", source: "Google Ads", interest: "Planejamento", value: 35000, stage: "novo", temperature: "morno", createdAt: new Date().toISOString(), interactions: [] },
    { id: uid(), name: "Roberto Tavares", company: "Tavares S/A", email: "roberto@tavares.sa", phone: "+55 11 93333-7777", source: "Indicação", interest: "Reestruturação", value: 95000, stage: "fechado", temperature: "quente", createdAt: new Date().toISOString(), interactions: [] },
  ],
  projects: [
    {
      id: uid(),
      name: "Reestruturação Tavares S/A",
      client: "Tavares S/A",
      description: "Projeto de reestruturação operacional e financeira completa.",
      startDate: new Date(Date.now()-30*86400000).toISOString(),
      dueDate: new Date(Date.now()+45*86400000).toISOString(),
      tasks: [
        { id: uid(), title: "Diagnóstico inicial", status: "done", priority: "alta", assignee: "u1" },
        { id: uid(), title: "Mapeamento de processos", status: "done", priority: "alta", assignee: "u2" },
        { id: uid(), title: "Análise financeira", status: "doing", priority: "alta", assignee: "u3", dueDate: new Date(Date.now()+5*86400000).toISOString() },
        { id: uid(), title: "Plano de ação", status: "todo", priority: "media", assignee: "u1" },
        { id: uid(), title: "Apresentação executiva", status: "todo", priority: "alta", assignee: "u4" },
      ],
    },
    {
      id: uid(),
      name: "Auditoria FM Tech",
      client: "FM Tech",
      description: "Auditoria de processos internos e compliance.",
      startDate: new Date(Date.now()-15*86400000).toISOString(),
      dueDate: new Date(Date.now()+10*86400000).toISOString(),
      tasks: [
        { id: uid(), title: "Coleta de documentos", status: "done", priority: "media", assignee: "u2" },
        { id: uid(), title: "Entrevistas", status: "doing", priority: "media", assignee: "u3" },
        { id: uid(), title: "Relatório preliminar", status: "todo", priority: "alta", assignee: "u1" },
      ],
    },
    {
      id: uid(),
      name: "M&A Prado Investimentos",
      client: "Prado Investimentos",
      description: "Assessoria em fusões e aquisições.",
      startDate: new Date(Date.now()-5*86400000).toISOString(),
      dueDate: new Date(Date.now()+90*86400000).toISOString(),
      tasks: [
        { id: uid(), title: "Due diligence", status: "doing", priority: "alta", assignee: "u4" },
        { id: uid(), title: "Valuation", status: "todo", priority: "alta", assignee: "u1" },
      ],
    },
  ],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const store = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  // Leads
  addLead(lead: Omit<Lead, "id" | "createdAt" | "interactions">) {
    state = { ...state, leads: [{ ...lead, id: uid(), createdAt: new Date().toISOString(), interactions: [] }, ...state.leads] };
    emit();
  },
  updateLead(id: string, patch: Partial<Lead>) {
    state = { ...state, leads: state.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) };
    emit();
  },
  moveLead(id: string, stage: LeadStage) {
    this.updateLead(id, { stage });
  },
  addInteraction(leadId: string, interaction: Omit<Interaction, "id">) {
    state = {
      ...state,
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, interactions: [{ ...interaction, id: uid() }, ...l.interactions] } : l
      ),
    };
    emit();
  },
  // Projects
  addProject(p: Omit<Project, "id" | "tasks">) {
    state = { ...state, projects: [{ ...p, id: uid(), tasks: [] }, ...state.projects] };
    emit();
  },
  addTask(projectId: string, task: Omit<Task, "id">) {
    state = {
      ...state,
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, tasks: [...p.tasks, { ...task, id: uid() }] } : p
      ),
    };
    emit();
  },
  updateTask(projectId: string, taskId: string, patch: Partial<Task>) {
    state = {
      ...state,
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) }
          : p
      ),
    };
    emit();
  },
  moveTask(projectId: string, taskId: string, status: TaskStatus) {
    this.updateTask(projectId, taskId, { status });
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state)
  );
}

export function projectProgress(p: Project) {
  if (p.tasks.length === 0) return 0;
  const done = p.tasks.filter((t) => t.status === "done").length;
  return Math.round((done / p.tasks.length) * 100);
}

export function projectStatus(p: Project): "ok" | "risk" | "late" {
  const due = new Date(p.dueDate).getTime();
  const now = Date.now();
  const progress = projectProgress(p);
  if (now > due && progress < 100) return "late";
  const total = due - new Date(p.startDate).getTime();
  const elapsed = now - new Date(p.startDate).getTime();
  const expected = total > 0 ? (elapsed / total) * 100 : 0;
  if (progress + 15 < expected) return "risk";
  return "ok";
}
