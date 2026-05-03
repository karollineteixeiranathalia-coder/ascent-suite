import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useStore } from "@/lib/store";
import { FileText, FileSpreadsheet, FileImage, Upload, Download, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/documentos")({
  component: () => (
    <AppLayout>
      <DocumentosPage />
    </AppLayout>
  ),
});

const docs = [
  { name: "Contrato — Tavares S/A.pdf", type: "pdf", size: "1.2 MB", project: "Reestruturação Tavares S/A", date: "há 2 dias" },
  { name: "Análise financeira Q3.xlsx", type: "xlsx", size: "340 KB", project: "Reestruturação Tavares S/A", date: "há 4 dias" },
  { name: "Diagnóstico inicial.pdf", type: "pdf", size: "2.4 MB", project: "Auditoria FM Tech", date: "há 1 semana" },
  { name: "Apresentação executiva.pdf", type: "pdf", size: "5.1 MB", project: "M&A Prado Investimentos", date: "há 3 dias" },
  { name: "Modelo de proposta.docx", type: "doc", size: "120 KB", project: "Modelos", date: "há 1 mês" },
  { name: "Logo cliente.png", type: "img", size: "88 KB", project: "Auditoria FM Tech", date: "há 2 semanas" },
];

function DocumentosPage() {
  const projects = useStore((s) => s.projects);
  const [q, setQ] = useState("");
  const filtered = docs.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));

  const icon = (t: string) => t === "xlsx" ? FileSpreadsheet : t === "img" ? FileImage : FileText;
  const color = (t: string) => t === "xlsx" ? "text-success" : t === "img" ? "text-primary" : "text-warning";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Documentos"
        subtitle={`${docs.length} arquivos em ${projects.length} projetos`}
        actions={
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
            <Upload className="w-4 h-4" /> Upload
          </button>
        }
      />

      <div className="relative max-w-md mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar arquivo..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/50 transition" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d, i) => {
          const Icon = icon(d.type);
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center ${color(d.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <button className="p-1.5 hover:bg-secondary rounded-md transition text-muted-foreground hover:text-foreground">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm font-medium truncate">{d.name}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{d.project}</div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-3 uppercase tracking-wider">
                <span>{d.size}</span>
                <span>{d.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
