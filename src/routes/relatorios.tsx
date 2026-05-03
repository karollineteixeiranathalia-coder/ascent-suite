import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/relatorios")({
  component: () => <ComingSoon title="Relatórios" subtitle="Análises e métricas detalhadas." />,
});
