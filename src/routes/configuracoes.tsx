import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  component: () => (
    <AppLayout>
      <ConfigPage />
    </AppLayout>
  ),
});

function ConfigPage() {
  const [profile, setProfile] = useState({ name: "Admin", email: "admin@assess.com", company: "Assess Consultoria" });
  const [prefs, setPrefs] = useState({ notifEmail: true, notifPush: false, weeklyDigest: true, autoFollowUp: true });
  const [dark, setDark] = useState(false);

  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const save = () => toast.success("Configurações salvas");

  const inp = "w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 transition";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader title="Configurações" subtitle="Preferências da conta e do espaço de trabalho." />

      <div className="space-y-6">
        <Section title="Perfil">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome"><input className={inp} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
            <Field label="Email"><input className={inp} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field>
          </div>
          <Field label="Empresa"><input className={inp} value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} /></Field>
        </Section>

        <Section title="Aparência">
          <Toggle label="Modo escuro" desc="Reduz cansaço visual em ambientes com pouca luz" value={dark} onChange={toggleDark} />
        </Section>

        <Section title="Notificações">
          <Toggle label="Por email" desc="Receba alertas no seu inbox" value={prefs.notifEmail} onChange={(v) => setPrefs({ ...prefs, notifEmail: v })} />
          <Toggle label="Push no navegador" desc="Notificações em tempo real" value={prefs.notifPush} onChange={(v) => setPrefs({ ...prefs, notifPush: v })} />
          <Toggle label="Resumo semanal" desc="Toda segunda às 9h" value={prefs.weeklyDigest} onChange={(v) => setPrefs({ ...prefs, weeklyDigest: v })} />
        </Section>

        <Section title="Automação">
          <Toggle label="Follow-up automático" desc="Sugere follow-ups baseado em inatividade do lead" value={prefs.autoFollowUp} onChange={(v) => setPrefs({ ...prefs, autoFollowUp: v })} />
        </Section>

        <div className="flex justify-end">
          <button onClick={save} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">Salvar alterações</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
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

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow-sm transition-transform ${value ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}
