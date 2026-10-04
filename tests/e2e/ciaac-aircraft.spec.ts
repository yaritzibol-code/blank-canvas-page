/** Isolated first-LP UI cases. Use the fixture server; no account writes are performed. */
import { test, expect, type Page } from "@playwright/test";
const URL = "/tests/fixtures/ciaac-preview.html?lesson=1";
const next = (page: Page) => page.getByRole("button", { name: "Continuar", exact: true });
async function mapConcepts(page: Page) {
  const map = page.locator(".av-map");
  for (const [phrase, slot] of [
    ["La máquina", "Aeronave"],
    ["Una condición física", "Físicamente en el aire"],
    ["Un intervalo definido", "Tiempo de vuelo"],
  ]) {
    await map.getByRole("button", { name: phrase, exact: true }).click();
    await map.getByRole("button", { name: new RegExp(`^${slot}:`) }).click();
  }
}

test("five scenes resolve by conceptual choices and finish once", async ({ page }) => {
  await page.goto(URL);
  await expect(page.getByRole("heading", { name: "Aeronave en vuelo", exact: true })).toBeVisible();
  await expect(page.locator('input[type="text"], textarea')).toHaveCount(0);
  await expect(next(page)).toBeDisabled();
  for (const label of ["Avión", "Helicóptero", "Planeador", "Globo", "Aerodeslizador"]) {
    await page
      .getByRole("button", { name: new RegExp(`^${label}`) })
      .first()
      .click();
    await page
      .getByRole("button", {
        name: label === "Aerodeslizador" ? /^Queda fuera de esta definición/ : /^Es aeronave/,
      })
      .click();
  }
  await next(page).click();
  await page.getByRole("button", { name: "En el aire", exact: true }).click();
  await mapConcepts(page);
  await next(page).click();
  await page.getByLabel("Empieza a contar", { exact: true }).selectOption("3");
  await expect(
    page.getByText("Ese momento inicia el tiempo en el aire.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Empieza a contar", { exact: true }).selectOption("1");
  await page.getByLabel("Termina", { exact: true }).selectOption("5");
  await page.getByRole("button", { name: /^2\. Compara el propósito/ }).click();
  await page.getByRole("button", { name: /Sí: tiene el propósito de despegar/ }).click();
  await page.getByRole("button", { name: /^Lo cambian de hangar/ }).click();
  await page.getByRole("button", { name: /No: no tiene el propósito de despegar/ }).click();
  await next(page).click();
  const map = page.locator(".av-map");
  await map.getByRole("button", { name: "Empieza a girar el rotor", exact: true }).click();
  await map.getByRole("button", { name: /^Aquí empieza el intervalo:/ }).click();
  await map
    .getByRole("button", { name: "Aeronave y palas detenidas al terminar", exact: true })
    .click();
  await map.getByRole("button", { name: /^Aquí termina el intervalo:/ }).click();
  await page.getByRole("button", { name: /^2\. ¿Qué condición falta/ }).click();
  await page.getByRole("button", { name: /Que las palas del rotor se detengan/ }).click();
  await next(page).click();
  await page.getByRole("button", { name: /Sí: importa cómo puede sostenerse/ }).click();
  await page.getByRole("button", { name: /^2\. Una espera en tierra/ }).click();
  await page
    .getByRole("button", { name: /Sigue contando: la operación aún no ha terminado/ })
    .click();
  await page.getByRole("button", { name: /^3\. Ya aterrizó, pero/ }).click();
  await page.getByRole("button", { name: /Que las palas del rotor se detengan/ }).click();
  await mapConcepts(page);
  await page.getByRole("button", { name: "Completar recorrido", exact: true }).click();
  await expect(page.getByTestId("completion-status")).toHaveText("complete");
  await expect(
    page.getByRole("button", { name: "Recorrido completado", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(page.getByText("Tu recorrido está completado.", { exact: false })).toBeVisible();
});

test("mobile, keyboard, reduced motion and reset cancellation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(URL);
  const plane = page.getByRole("button", { name: "Planeador", exact: true });
  await plane.focus();
  await plane.press("Enter");
  await expect(plane).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^Es aeronave/ }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: /^Planeador/ }).first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Reiniciar recorrido", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Planeador/ }).first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await expect(page.locator(".av-pathy img")).toHaveAttribute("src", "/lp/visual/pathy.png");
  await expect(page.locator(".lp-study")).toHaveClass(/lp-study--conceptual/);
});
