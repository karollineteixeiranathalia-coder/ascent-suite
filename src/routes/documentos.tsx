import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/documentos")({
  component: () => <ComingSoon title="Documentos" subtitle="Arquivos, contratos e modelos." />,
});
