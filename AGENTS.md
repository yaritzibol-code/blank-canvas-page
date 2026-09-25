# Project architecture rules

- Keep `@cloudflare/vite-plugin` and Vite pinned to exact compatible versions; newer transitive releases can generate invalid environment definitions during SSR builds.