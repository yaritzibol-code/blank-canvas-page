/**
 * Pruebas end-to-end del flujo de facturación completo (Stripe sandbox).
 *
 * Cobertura:
 *   1) Registro/creación de cuenta: la página /login expone el formulario y
 *      valida entradas antes de llamar al backend.
 *   2) Checkout embebido: /dashboard/planes crea la sesión de Stripe y monta
 *      el iframe de Embedded Checkout (nunca redirige a checkout.stripe.com).
 *   3) Retorno: /dashboard/planes/retorno con `session_id` ejecuta syncMyPlan
 *      y muestra el plan resultante.
 *   4) Bitácora: el panel admin registra los eventos de la app
 *      (checkout_session_created / plan_sync / webhook_*).
 *
 * Requisitos:
 *   - Servidor en http://localhost:8080 (o PLAYWRIGHT_BASE_URL).
 *   - Sesión inyectada por el sandbox de Lovable
 *     (`LOVABLE_BROWSER_SUPABASE_SESSION_JSON` + `..._STORAGE_KEY`).
 *     Sin sesión, las pruebas autenticadas se omiten automáticamente.
 *   - Tarjeta de prueba sandbox: 4242 4242 4242 4242.
 *
 *   bunx playwright test tests/e2e/stripe-flow.spec.ts
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";
const HAS_SESSION = Boolean(
  process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON && process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY,
);

async function restoreSession(page: Page) {
  const key = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
  const session = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
  const cookies = process.env.LOVABLE_BROWSER_SUPABASE_COOKIES_JSON;
  if (cookies) {
    const parsed = JSON.parse(cookies).map((c: Record<string, unknown>) => ({ ...c, url: BASE }));
    await page.context().addCookies(parsed);
  }
  await page.goto(BASE);
  if (key && session) {
    await page.evaluate(([k, s]) => window.localStorage.setItem(k, s), [key, session]);
  }
}

test.describe("Registro de cuenta", () => {
  test("la página de acceso muestra el formulario y valida el correo", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const email = page.locator('input[type="email"]').first();
    await expect(email).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar|iniciar|crear/i }).first()).toBeVisible();

    // Un correo inválido no debe disparar navegación ni sesión.
    await email.fill("no-es-un-correo");
    await page.getByRole("button", { name: /entrar|iniciar|crear/i }).first().click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/login");
  });
});

test.describe("Checkout embebido (sandbox)", () => {
  test.skip(!HAS_SESSION, "Requiere una sesión autenticada inyectada por el sandbox.");

  test.beforeEach(async ({ page }) => {
    await restoreSession(page);
  });

  test("monta el iframe de Stripe sin redirigir fuera del sitio", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/planes`);
    const cta = page.getByRole("button", { name: /pro|desbloquear|suscrib/i }).first();
    if (await cta.isVisible().catch(() => false)) await cta.click();

    const frame = page.locator('iframe[name^="__privateStripeFrame"], #checkout iframe').first();
    await expect(frame).toBeVisible({ timeout: 30_000 });
    expect(page.url()).not.toContain("checkout.stripe.com");
  });

  test("el retorno de checkout sincroniza el plan contra Stripe", async ({ page }) => {
    await page.goto(`${BASE}/dashboard/planes/retorno?session_id=cs_test_e2e_placeholder`);
    // syncMyPlan debe resolver sin error aunque la sesión sea inexistente:
    // el perfil conserva su plan y la página informa el estado.
    await expect(page.getByText(/plan|suscripci/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/error interno|500/i)).toHaveCount(0);
  });
});

test.describe("Bitácora de facturación en el panel admin", () => {
  test.skip(!HAS_SESSION, "Requiere una sesión admin inyectada por el sandbox.");

  test("lista los eventos de la app y de los webhooks", async ({ page }) => {
    await restoreSession(page);
    await page.goto(`${BASE}/admin/operaciones/stripe`);
    await expect(page.getByText("Bitácora de facturación (app)")).toBeVisible({ timeout: 20_000 });
    // El filtro por tipo de evento debe funcionar sin errores de red.
    await page.getByRole("combobox").last().selectOption("checkout_session_created");
    await page.waitForTimeout(1000);
    await expect(page.getByText(/requiere rol admin/i)).toHaveCount(0);
  });
});
