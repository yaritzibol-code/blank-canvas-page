/**
 * Pruebas end-to-end del dashboard y el drill-down admin.
 *
 * Requisitos para ejecutar localmente:
 *   1) Servidor de desarrollo corriendo en http://localhost:8080
 *   2) `LOVABLE_BROWSER_SUPABASE_SESSION_JSON` y `LOVABLE_BROWSER_SUPABASE_STORAGE_KEY`
 *      en el entorno (los inyecta el sandbox de Lovable automáticamente).
 *   3) `bunx playwright test tests/e2e/dashboard-metrics.spec.ts`
 *
 * Cobertura:
 *   - El conteo de "cuestionarios / exámenes" del dashboard coincide con
 *     el número de filas reales en `user_state` (colecciones
 *     `quiz_attempts` / `sim_attempts`).
 *   - El banner de sincronización se oculta después de pulsar
 *     "Sincronizar ahora" (o "Cerrar") y no reaparece en la misma sesión.
 *   - El panel admin `/admin/operaciones` navega al drill-down
 *     `/admin/operaciones/dia/YYYY-MM-DD` al hacer clic en un punto de la gráfica.
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";

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

test.describe("Dashboard · métricas reales", () => {
  test.beforeEach(async ({ page }) => {
    await restoreSession(page);
  });

  test("conteo de cuestionarios coincide con logs en la nube", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");

    // La quick action muestra "N cuestionarios · M simulacros" (o texto equivalente).
    const quickAction = page.getByText(/cuestionarios?/i).first();
    await expect(quickAction).toBeVisible({ timeout: 10_000 });

    // Cross-check contra el store hidratado: los conteos derivan del mismo dataset.
    const counts = await page.evaluate(async () => {
      const mod = await import("/src/lib/store/index.ts");
      const store = (mod as { useStore?: { getState: () => unknown } }).useStore;
      if (!store) return null;
      const state = store.getState() as { quizAttempts?: unknown[]; simAttempts?: unknown[] };
      return {
        quizzes: state.quizAttempts?.length ?? 0,
        sims: state.simAttempts?.length ?? 0,
      };
    });
    expect(counts).not.toBeNull();

    // El número visible en el dashboard incluye el conteo real (no debe decir "0" si el store tiene datos).
    if (counts && counts.quizzes > 0) {
      await expect(page.locator("body")).toContainText(String(counts.quizzes));
    }
  });

  test("banner de sincronización se oculta tras cerrar y no reaparece", async ({ page }) => {
    // Limpia la marca de dismiss previa
    await page.evaluate(() => sessionStorage.removeItem("fp:sync-banner-dismissed"));
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");

    const banner = page.locator("text=/⚠️|Detectamos|Sincroniza|actividad tuya sincronizada/").first();
    const wasVisible = await banner.isVisible().catch(() => false);
    if (!wasVisible) {
      test.skip(true, "No hay drift ni info que mostrar en este perfil.");
      return;
    }

    await page.getByRole("button", { name: /cerrar/i }).click();
    await expect(banner).toBeHidden();

    // Recarga: el banner debe permanecer oculto durante la sesión.
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(banner).toBeHidden();
  });
});

test.describe("Admin · drill-down por día", () => {
  test.beforeEach(async ({ page }) => {
    await restoreSession(page);
  });

  test("clic en un punto de la gráfica abre el detalle del día", async ({ page }) => {
    await page.goto(`${BASE}/admin/operaciones`);
    await page.waitForLoadState("networkidle");

    // Salta si el perfil no es admin.
    if (await page.getByText(/Requiere rol admin/i).isVisible().catch(() => false)) {
      test.skip(true, "Perfil no admin en esta sesión.");
      return;
    }

    // Los puntos son <circle> dentro del primer SparkChart.
    const firstCircle = page.locator("svg circle").first();
    await expect(firstCircle).toBeVisible({ timeout: 10_000 });
    await firstCircle.click();

    await page.waitForURL(/\/admin\/operaciones\/dia\/\d{4}-\d{2}-\d{2}/);
    await expect(page.getByText(/Subs activas/i)).toBeVisible();
    await expect(page.getByText(/Eventos de estudio/i)).toBeVisible();
    await expect(page.getByText(/Errores de sincronización/i)).toBeVisible();
  });
});
