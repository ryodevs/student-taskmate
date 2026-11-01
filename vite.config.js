import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        role: resolve(__dirname, "role.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        pengurus: resolve(__dirname, "pengurus.html"),
        anggota: resolve(__dirname, "anggota.html"),
      },
    },
  },
});
