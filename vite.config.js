import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    target: "esnext", // izinkan top-level await di role.js / dashboard.js
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        role: resolve(__dirname, "role.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
      },
    },
  },
});
