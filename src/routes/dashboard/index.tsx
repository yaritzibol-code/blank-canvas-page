import { createFileRoute } from "@tanstack/react-router";
import { Director } from "@/components/flightdeck/Director";
export const Route = createFileRoute("/dashboard/")({ component: Director });
