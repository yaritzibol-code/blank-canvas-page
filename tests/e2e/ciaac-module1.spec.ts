/** Local isolated UI tests. Run the fixture Vite config at port8081 first. */
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { CiaacModuleContent } from "../../src/lib/lp/ciaac-content-types";
const content = JSON.parse(
  readFileSync(new URL("../../src/lib/lp/ciaac-module1.content.json", import.meta.url), "utf8"),
) as CiaacModuleContent;

const fixture = (lesson: number) => `/tests/fixtures/ciaac-preview.html?lesson=${lesson}`;

test("prediction is non-blocking, progress survives reload, reset cancellation preserves it", async ({
  page,
}) => {
  await page.goto(fixture(2));
  await page.getByRole("button", { name: "Iniciar recorrido", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
  const question = content.lessons[1].document.questions[0];
  const wrong = question.options.find((_, index) => index !== question.correct)!;
  await page.getByRole("button", { name: wrong, exact: false }).click();
  await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator(".ciaac-visual")).toBeVisible();
  await page.reload();
  await expect(page.locator(".ciaac-visual")).toBeVisible();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Reiniciar recorrido", exact: true }).click();
  await expect(page.locator(".ciaac-visual")).toBeVisible();
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Primero, ¿qué crees que sucede?" }),
  ).toBeVisible();
});

for (const lesson of [2, 3, 4, 5]) {
  test(`lesson${lesson} has responsive original art and accessible exploration`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(fixture(lesson));
    await expect(
      page.getByRole("img", { name: "FlightPath, tu ruta al siguiente nivel" }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "Pathy acompaña tu recorrido" })).toBeVisible();
    await page.getByRole("button", { name: "Iniciar recorrido", exact: true }).click();
    const question = content.lessons[lesson - 1].document.questions[0];
    await page
      .getByRole("button", { name: question.options[question.correct], exact: false })
      .click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.locator(".ciaac-visual")).toBeVisible();
    await expect(page.locator(".ciaac-visual svg[role=img]").first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    const slider = page.locator(".ciaac-visual input[type=range]").first();
    if (await slider.count()) {
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      await expect(slider).toBeFocused();
    }
    await page.getByText("Fuentes y alcance de este recorrido", { exact: true }).click();
    await expect(
      page.getByText("Adaptación pedagógica de FlightPath.", { exact: false }),
    ).toBeVisible();
    const sources = page.locator(".hb-source").filter({
      has: page.getByText("Fuentes y alcance de este recorrido", { exact: true }),
    });
    const references = content.lessons[lesson - 1].sourceRefs.map((id) => content.sources[id]);
    await expect(sources.locator("a")).toHaveCount(
      references.filter((source) => source.url).length,
    );
    for (const source of references) {
      await expect(sources.getByText(source.title, { exact: true })).toBeVisible();
      if (source.url) {
        await expect(
          sources.getByRole("link", { name: source.title, exact: true }),
        ).toHaveAttribute("href", source.url);
      } else {
        await expect(sources.getByRole("link", { name: source.title, exact: true })).toHaveCount(0);
      }
    }
  });
}
