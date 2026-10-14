import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  // GitHub Pages ではリポジトリ名のサブパスで配信されるため、Actions ビルド時のみ base を変える
  base: process.env.GITHUB_ACTIONS ? "/grand-voyage-bingo/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
