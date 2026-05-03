import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/notificacoes")({
  component: () => <ComingSoon title="Notificações" subtitle="Acompanhe alertas e atualizações." />,
});
