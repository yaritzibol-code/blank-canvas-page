/** Isolated native first-LP UI cases. No account writes are performed. */
import { test, expect, type Page } from "@playwright/test";
const URL = "/tests/fixtures/ciaac-preview.html?lesson=1";
const next = (page: Page) => page.getByRole("button", { name: "Continuar", exact: true });
async function reachConcept(page: Page) {
  await page.goto(URL);
  await page.getByRole("button", { name: "Iniciar recorrido", exact: true }).click();
  await expect(next(page)).toBeDisabled();
  await expect(page.locator('img[src$="preflight-pushback.png"]')).toBeVisible();
  await page.getByRole("button", { name: /No, hasta separarse del suelo/ }).click();
  await expect(next(page)).toBeEnabled();
  await next(page).click();
}
test("native ten-stage flow gates practice and completes once", async ({ page }) => {
  await reachConcept(page);
  await expect(
    page.getByRole("heading", { name: "¿Qué es una aeronave?", exact: true }),
  ).toBeVisible();
  await expect(page.locator('img[src$="aircraft-support.png"]')).toBeVisible();
  await next(page).click();
  await expect(page.getByText("Tiempo de vuelo · 68 minutos", { exact: true })).toBeVisible();
  await next(page).click();
  await expect(page.locator('img[src$="helicopter-rotor.png"]')).toBeVisible();
  await next(page).click();
  await expect(next(page)).toBeDisabled();
  const pairs = page.locator(".hb-pair-grid");
  const left = pairs.locator(":scope > div").nth(0).getByRole("button");
  const right = pairs.locator(":scope > div").nth(1).getByRole("button");
  for (const [i, j] of [
    [0, 1],
    [1, 3],
    [2, 0],
    [3, 2],
  ]) {
    await left.nth(i).click();
    await right.nth(j).click();
  }
  await page.getByRole("button", { name: "Comprobar relaciones", exact: true }).click();
  await next(page).click();
  await expect(page.locator(".hb-quiz-with-visual")).toHaveCount(0);
  const questions = page.locator(".hb-question");
  for (const [index, label] of [
    [0, "Verdadero"],
    [1, "Falso"],
    [2, "Falso"],
  ] as const) {
    await questions
      .nth(index)
      .getByRole("button", { name: new RegExp(label) })
      .click();
  }
  await next(page).click();
  await page.getByRole("button", { name: /No, falta el propósito de despegar/ }).click();
  await next(page).click();
  await expect(
    page.getByRole("heading", { name: "¿Con qué hora cierras el intervalo?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "12:20", exact: true }).click();
  await expect(page.getByText(/El intervalo termina a las 12:27/)).toBeVisible();
  await page.getByRole("button", { name: "12:27", exact: true }).click();
  await expect(page.getByText(/Correcto: a las 12:27/)).toBeVisible();
  await expect(page.getByText("La idea que te llevas:", { exact: true })).toBeVisible();
  await next(page).click();
  await expect(
    page.getByRole("button", { name: "Completar Learning Path", exact: true }),
  ).toBeDisabled();
  for (const check of await page.locator(".hb-checks button").all()) await check.click();
  await page.getByRole("button", { name: "Completar Learning Path", exact: true }).click();
  await expect(page.getByTestId("completion-status")).toHaveText("complete");
  await expect(page.getByRole("button", { name: "Completado", exact: true })).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Recorrido completado.", exact: true }),
  ).toBeVisible();
});
test("preflight and concept remain readable on mobile without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await reachConcept(page);
  await expect(page.locator('img[src$="aircraft-support.png"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: "qa/approved-aircraft-mobile.png", fullPage: true });
});
test("desktop preflight screenshot uses the question and illustration together", async ({
  page,
}) => {
  await page.goto(URL);
  await page.getByRole("button", { name: "Iniciar recorrido", exact: true }).click();
  await expect(page.locator('img[src$="preflight-pushback.png"]')).toBeVisible();
  await page.screenshot({ path: "qa/approved-aircraft-preflight.png", fullPage: true });
});
