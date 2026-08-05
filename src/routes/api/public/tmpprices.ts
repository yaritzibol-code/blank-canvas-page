import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/public/tmpprices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const env = new URL(request.url).searchParams.get("env") === "live" ? "live" : "sandbox";
        try {
          const stripe = createStripeClient(env);
          const prices = await stripe.prices.list({ limit: 100, expand: ["data.product"] });
          return Response.json(
            prices.data.map((p) => ({
              id: p.id,
              lookup_key: p.lookup_key,
              amount: p.unit_amount,
              currency: p.currency,
              interval: p.recurring?.interval ?? null,
              active: p.active,
              product: typeof p.product === "string" ? p.product : { id: p.product.id, name: (p.product as { name?: string }).name },
            })),
          );
        } catch (e) {
          return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
        }
      },
    },
  },
});
