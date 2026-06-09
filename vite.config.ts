import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const port = Number(process.env.PORT || 5173);

export default defineConfig({
  server: {
    host: "localhost",
    port,
    strictPort: true,
    allowedHosts: true,
  },
  plugins: [reactRouter(), tsconfigPaths()],
});
