import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@\/lib\/store$/,
        replacement: fileURLToPath(new URL("./ciaac-store-stub.ts", import.meta.url)),
      },
      { find: "@", replacement: fileURLToPath(new URL("../../src", import.meta.url)) },
    ],
  },
  optimizeDeps: { entries: ["tests/fixtures/ciaac-preview.html"] },
  server: { host: "127.0.0.1", port: 8081, strictPort: true },
});
