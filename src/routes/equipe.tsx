import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/equipe")({
  component: () => <ComingSoon title="Equipe" subtitle="Gerencie membros, papéis e permissões." />,
});
