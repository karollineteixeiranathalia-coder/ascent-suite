import { AppLayout } from "./AppLayout";
import { PageHeader } from "./PageHeader";
import { Construction } from "lucide-react";

export function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <PageHeader title={title} subtitle={subtitle} />
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
            <Construction className="w-5 h-5 text-accent-foreground" />
          </div>
          <h3 className="font-semibold tracking-tight">Em breve</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Este módulo está em desenvolvimento e estará disponível na próxima atualização.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
