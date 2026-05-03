import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/tarefas")({
  component: () => <ComingSoon title="Tarefas" subtitle="Visualize todas as suas tarefas em um só lugar." />,
});
