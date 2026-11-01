import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        role: resolve(__dirname, "role.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
      },
    },
  },
});
