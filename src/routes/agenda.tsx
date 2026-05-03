import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/agenda")({
  component: () => <ComingSoon title="Agenda" subtitle="Compromissos, reuniões e follow-ups." />,
});
