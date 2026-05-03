import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { LEAD_STAGES, Lead, LeadStage, LeadTemp, store, useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Plus, Search, Phone, Mail, Building2, Flame, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/leads")({
  component: () => (
    <AppLayout>
      <LeadsPage />
    </AppLayout>
  ),
});

function tempColor(t: LeadTemp) {
  return t === "quente" ? "bg-hot" : t === "morno" ? "bg-warm" : "bg-cold";
}

function LeadsPage() {
  const leads = useStore((s) => s.leads);
  const [query, setQuery] = useState("");
  const [tempFilter, setTempFilter] = useState<"all" | LeadTemp>("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Lead | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (tempFilter !== "all" && l.temperature !== tempFilter) return false;
      if (query && !`${l.name} ${l.company} ${l.email}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [leads, query, tempFilter]);

  const onDrop = (stage: LeadStage) => {
    if (draggingId) {
      store.moveLead(draggingId, stage);
      toast.success("Lead movido", { description: LEAD_STAGES.find((s) => s.id === stage)?.label });
    }
    setDraggingId(null);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Leads"
        subtitle="Pipeline inteligente — arraste e solte entre as etapas."
        actions={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo lead
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, empresa ou email..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 transition"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {(["all", "quente", "morno", "frio"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTempFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tempFilter === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "Todos" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {LEAD_STAGES.map((stage) => {
          const items = filtered.filter((l) => l.stage === stage.id);
          const total = items.reduce((s, l) => s + l.value, 0);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(stage.id)}
              className="bg-secondary/40 rounded-xl p-3 min-h-[400px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stage.label}</span>
                  <span className="text-[10px] bg-background border border-border rounded-full px-1.5 py-0.5 tabular-nums">{items.length}</span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mb-3 px-1 tabular-nums">
                R$ {total.toLocaleString("pt-BR")}
              </div>
              <div className="space-y-2">
                {items.map((l) => (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={() => setDraggingId(l.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => setActive(l)}
                    className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-sm transition-all duration-200 animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{l.name}</div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {l.company}
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${tempColor(l.temperature)} mt-1.5 flex-shrink-0`} title={l.temperature} />
                    </div>
                    <div className="text-xs font-semibold text-foreground tabular-nums">
                      R$ {l.value.toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {open && <NewLeadDialog onClose={() => setOpen(false)} />}
      {active && <LeadDetail lead={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function NewLeadDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", source: "Website",
    interest: "", value: 0, temperature: "morno" as LeadTemp, stage: "novo" as LeadStage,
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim()) return toast.error("Preencha nome e empresa");
    store.addLead(form);
    toast.success("Lead criado");
    onClose();
  };
  return (
    <Dialog onClose={onClose} title="Novo lead">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome"><input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Empresa"><input className={inp} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><input type="email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Telefone"><input className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origem">
            <select className={inp} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {["Website", "LinkedIn", "Indicação", "Evento", "Google Ads", "Outro"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Valor potencial (R$)"><input type="number" className={inp} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Interesse"><input className={inp} value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Temperatura">
            <select className={inp} value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value as LeadTemp })}>
              <option value="quente">Quente</option><option value="morno">Morno</option><option value="frio">Frio</option>
            </select>
          </Field>
          <Field label="Etapa">
            <select className={inp} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as LeadStage })}>
              {LEAD_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg hover:bg-secondary transition">Cancelar</button>
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">Criar lead</button>
        </div>
      </form>
    </Dialog>
  );
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const current = useStore((s) => s.leads.find((l) => l.id === lead.id)) || lead;
  const [note, setNote] = useState("");
  const addNote = () => {
    if (!note.trim()) return;
    store.addInteraction(current.id, { type: "nota", note, date: new Date().toISOString() });
    setNote("");
    toast.success("Interação registrada");
  };
  return (
    <Dialog onClose={onClose} title={current.name} size="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${tempColor(current.temperature)}`} />
          <span className="text-xs text-muted-foreground capitalize">{current.temperature}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{LEAD_STAGES.find((s) => s.id === current.stage)?.label}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info icon={Building2} label={current.company} />
          <Info icon={Mail} label={current.email} />
          <Info icon={Phone} label={current.phone} />
          <Info icon={Flame} label={`R$ ${current.value.toLocaleString("pt-BR")}`} />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Interesse</div>
          <div className="text-sm">{current.interest || "—"}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Histórico</div>
          <div className="flex gap-2 mb-3">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Adicionar interação..." className={`${inp} flex-1`} />
            <button onClick={addNote} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">Salvar</button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {current.interactions.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma interação registrada.</div>}
            {current.interactions.map((i) => (
              <div key={i.id} className="border-l-2 border-primary/30 pl-3 py-1">
                <div className="text-xs text-muted-foreground">{new Date(i.date).toLocaleString("pt-BR")} · {i.type}</div>
                <div className="text-sm">{i.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function Info({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inp = "w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 transition";

export function Dialog({ onClose, title, children, size = "md" }: { onClose: () => void; title: string; children: React.ReactNode; size?: "md" | "lg" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-card border border-border rounded-2xl shadow-xl w-full ${size === "lg" ? "max-w-2xl" : "max-w-md"} p-6`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-md transition"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
