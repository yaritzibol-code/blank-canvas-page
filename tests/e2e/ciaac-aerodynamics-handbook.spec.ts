import { test, expect } from "@playwright/test";
import fs from "node:fs";
const content = JSON.parse(
  fs.readFileSync(
    new URL("../../src/lib/lp/ciaac-aerodynamics.content.json", import.meta.url),
    "utf8",
  ),
);
import type { HandbookLearningPathDocument } from "../../src/lib/lp/handbook-types";
for (const [id, data] of Object.entries(content)) {
  const document = data as HandbookLearningPathDocument;
  test(`native module ${document.chapter} lesson ${document.number}: complete, reload and mobile layout`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/tests/fixtures/ciaac-aerodynamics-preview.html?id=${encodeURIComponent(id)}`);
    await expect(page.locator(".ciaac-aerodynamics-handbook")).toBeVisible();
    await page.getByRole("button", { name: "Iniciar recorrido", exact: true }).click();
    const next = page.getByRole("button", { name: "Continuar", exact: true });
    let captured = false;
    for (const stage of document.stages.slice(1, -1)) {
      if (stage.kind === "quiz") {
        await expect(next).toBeDisabled();
        for (const index of stage.questions) {
          const q = document.questions[index];
          const value = stage.diagnostic ? (q.correct + 1) % q.options.length : q.correct;
          await page
            .getByRole("group", { name: q.prompt, exact: true })
            .getByRole("button")
            .filter({ hasText: q.options[value] })
            .click();
        }
      }
      if (stage.kind === "exercise" && document.exercise?.kind === "match") {
        await expect(next).toBeDisabled();
        const grids = page.locator(".hb-pair-grid > div");
        for (const [i, pair] of document.exercise.pairs.entries()) {
          await grids.nth(0).getByRole("button").nth(i).click();
          await grids.nth(1).getByRole("button", { name: pair[1], exact: true }).click();
        }
        await page.getByRole("button", { name: "Comprobar relaciones", exact: true }).click();
      }
      if (stage.kind === "exercise" && document.exercise?.kind === "sequence") {
        for (const item of document.exercise.items)
          await page.getByRole("button", { name: item, exact: true }).click();
        await page.getByRole("button", { name: "Comprobar secuencia", exact: true }).click();
      }
      await expect(page.locator("textarea, input")).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      if (!captured && (await page.locator('svg[role="img"]').count())) {
        await page.screenshot({
          path: `qa/aerodynamics-module-${document.chapter}-lesson-${document.number}-mobile.png`,
          fullPage: true,
        });
        captured = true;
      }
      await expect(next).toBeEnabled();
      await next.click();
    }
    for (const button of await page.locator(".hb-checks button").all()) await button.click();
    await page.getByRole("button", { name: "Completar Learning Path", exact: true }).click();
    await expect(page.getByTestId("completion-status")).toHaveText("complete");
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Recorrido completado.", exact: true }),
    ).toBeVisible();
  });
}
