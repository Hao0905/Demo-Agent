import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Alias '@' -> src để import tuyệt đối (shadcn/ui convention)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
