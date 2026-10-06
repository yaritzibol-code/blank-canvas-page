import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      Vary: "Authorization",
    },
  });
}

export const Route = createFileRoute("/api/admin/learning-path-review")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authenticateRequest, isRouteAdmin } = await import("@/lib/route-auth.server");
        const auth = await authenticateRequest(request);
        if (!auth) return json({ error: "unauthorized" }, 401);
        if (!(await isRouteAdmin(auth))) return json({ error: "forbidden" }, 403);
        const { learningPathReviewPayload } = await import("@/lib/lp/admin-review.server");
        const payload = learningPathReviewPayload(new URL(request.url).searchParams.get("lp"));
        return payload ? json(payload) : json({ error: "unavailable" }, 404);
      },
    },
  },
});
