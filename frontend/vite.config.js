import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  "/api": {
    target: "http://localhost:8010",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(
      process.env.VITE_BUILD_ID || process.env.RAILWAY_GIT_COMMIT_SHA || process.env.RAILWAY_DEPLOYMENT_ID || "local"
    ),
  },
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
});
