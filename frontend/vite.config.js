import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const productionBuildFallback = `production-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;
const buildId = process.env.VITE_BUILD_ID
  || process.env.RAILWAY_GIT_COMMIT_SHA
  || process.env.SOURCE_VERSION
  || process.env.RAILWAY_DEPLOYMENT_ID
  || (process.env.NODE_ENV === "production" ? productionBuildFallback : "local");

const apiProxy = {
  "/api": {
    target: "http://localhost:8010",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
});
