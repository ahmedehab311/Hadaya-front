import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const rawPort = env.PORT || process.env.PORT || "5173";
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = env.BASE_PATH || process.env.BASE_PATH || "/";
  const isReplit = !!process.env.REPL_ID;

  const replitPlugins: Plugin[] = [];
  if (isReplit) {
    try {
      const mod = await import("@replit/vite-plugin-runtime-error-modal");
      const fn = (mod.default ?? mod) as () => Plugin;
      replitPlugins.push(fn());
    } catch {}
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");
      if (process.env.NODE_ENV !== "production") {
        replitPlugins.push(
          cartographer({ root: path.resolve(import.meta.dirname, "..") }),
          devBanner(),
        );
      }
    } catch {}
  }

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), ...replitPlugins],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: { strict: true },
      proxy: isReplit
        ? undefined
        : {
            "/api": {
              target: "http://localhost:5000",
              changeOrigin: true,
            },
          },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
