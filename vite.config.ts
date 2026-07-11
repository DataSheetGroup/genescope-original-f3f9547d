// Vite config with dual-target support:
// - Local / Lovable preview: uses @lovable.dev/vite-tanstack-config (Cloudflare Worker preset)
// - Netlify: set NITRO_PRESET=netlify in netlify.toml — TanStack Start / Nitro
//   will emit a Netlify Function for SSR and static assets to dist/client.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
      preset: process.env.NITRO_PRESET || undefined,
    },
  },
});
