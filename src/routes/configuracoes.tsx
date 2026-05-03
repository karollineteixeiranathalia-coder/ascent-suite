import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/configuracoes")({
  component: () => <ComingSoon title="Configurações" subtitle="Preferências da conta e do espaço de trabalho." />,
});
