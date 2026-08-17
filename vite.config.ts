import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "@svgr/rollup";

/**
 * Two build targets share this config:
 *
 *   vite build                 → dist/       from index.html  (fan / artist app)
 *   vite build --mode admin    → dist-admin/ from admin.html  (staff console)
 *
 * They are deployed as separate origins (app./admin.getmuxify.com) so the admin
 * console's route table, nav and services never ship to non-staff users, and an
 * XSS in the creator app cannot reach an admin session. `--mode` is used rather
 * than an env var so the same command works on Windows and in the Linux image
 * build without needing cross-env.
 */
export default defineConfig(({ mode }) => {
  const isAdmin = mode === "admin";

  return {
  plugins: [react(), tailwindcss(), tsconfigPaths(), svgr({ icon: true })],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@auth": path.resolve(__dirname, "./src/features/auth"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@dashboard": path.resolve(__dirname, "./src/features/dashboard"),
      "@upload": path.resolve(__dirname, "./src/features/upload"),
      "@uploadMusic": path.resolve(__dirname, "./src/features/upload-music"),
      "@uploadVideo": path.resolve(__dirname, "./src/features/upload-video"),
      "@musicVideo": path.resolve(__dirname, "./src/features/music-video"),
      "@musicVideos": path.resolve(
        __dirname,
        "./src/features/music-and-videos"
      ),
      "@earningRoyalty": path.resolve(
        __dirname,
        "./src/features/earnings-and-royalty"
      ),
      "@leaderboard": path.resolve(__dirname, "./src/features/leaderboard"),
      "@fansSubscribers": path.resolve(
        __dirname,
        "./src/features/fans-and-subscribers"
      ),
      "@salesReport": path.resolve(__dirname, "./src/features/sales-report"),
      "@payments": path.resolve(__dirname, "./src/features/payments"),
      "@settings": path.resolve(__dirname, "./src/features/settings"),
      "@onboarding": path.resolve(__dirname, "./src/features/onboarding"),
      "@ads": path.resolve(__dirname, "./src/features/ads"),
      "@admin": path.resolve(__dirname, "./src/features/admin"),
    },
  },
  build: {
    outDir: isAdmin ? "dist-admin" : "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, isAdmin ? "admin.html" : "index.html"),
      },
    },
    copyPublicDir: true,
  },
  publicDir: "public",
  };
});
