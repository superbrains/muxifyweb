import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "@svgr/rollup";

export default defineConfig({
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
      "@addArtist": path.resolve(__dirname, "./src/features/add-artists"),
      "@settings": path.resolve(__dirname, "./src/features/settings"),
      "@onboarding": path.resolve(__dirname, "./src/features/onboarding"),
    },
  },
});
