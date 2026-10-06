import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const local = (name: string) => fileURLToPath(new URL(name, import.meta.url));
export default defineConfig({
  publicDir: false,
  plugins: [
    {
      name: "ciaac-portable-review-scope",
      enforce: "pre",
      load(id) {
        if (!id.endsWith("/ciaac-aircraft-approved/documents.json")) return;
        const docs = JSON.parse(readFileSync(id, "utf8"));
        const selected = Object.fromEntries(
          Object.entries(docs).filter(([, value]) => {
            const doc = value as { number: number };
            return doc.number >= 6 && doc.number <= 10;
          }),
        );
        // Return JSON so Vite's native JSON transformer can handle it normally.
        return JSON.stringify(selected);
      },
      transform(code, id) {
        if (!/\.(tsx?|json)$/.test(id) || id.includes("node_modules")) return;
        return code.replace(/(["'`])\/(lp|ciaac-approved)\//g, "$1./$2/");
      },
      generateBundle(_options, bundle) {
        const modules = Object.values(bundle).flatMap((item) =>
          item.type === "chunk" ? Object.keys(item.modules) : [],
        );
        const forbidden = modules.filter((id) =>
          /\/src\/(?:lib\/store\/|lib\/store\.(?:ts|tsx)$|server\/|routes\/|lib\/supabase|integrations\/)/.test(
            id,
          ),
        );
        if (forbidden.length)
          throw new Error(`Unsafe modules in review bundle: ${forbidden.join(", ")}`);
        this.emitFile({
          type: "asset",
          fileName: "review-build-modules.json",
          source: JSON.stringify(
            modules.map((id) => id.replace(local("../../"), "")),
            null,
            2,
          ),
        });
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      { find: /^@\/lib\/store\/lp-journey$/, replacement: local("./ciaac-review-journey-stub.ts") },
      {
        find: /^@\/components\/shared\/ReportProblemModal$/,
        replacement: local("./ciaac-portable-review-report-stub.tsx"),
      },
      { find: /^@\/lib\/store$/, replacement: local("./ciaac-store-stub.ts") },
      { find: "@", replacement: local("../../src") },
    ],
  },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: local("../../../ciaac-review-package/.build"),
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    cssCodeSplit: false,
    lib: {
      entry: local("./ciaac-portable-review.tsx"),
      name: "CiaacPortableReview",
      formats: ["iife"],
      fileName: () => "review.js",
      cssFileName: "review",
    },
  },
});
