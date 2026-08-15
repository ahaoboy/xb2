import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import analyzer from "vite-bundle-analyzer";

const isDev = process.env.NODE_ENV === "development";

// Deployed site URL (GitHub Pages); local dev uses the root path.
const DEPLOY_BASE = "https://ahaoboy.github.io/xb2/";

// https://vite.dev/config/
export default defineConfig({
  base: isDev ? "/" : DEPLOY_BASE,
  plugins: [
    react(),
    analyzer({
      enabled: !!process.env["analyzer"],
    }),
  ],
  resolve: {
    alias: isDev
      ? {}
      : {
        react: "https://esm.sh/react",
        "react-dom": "https://esm.sh/react-dom",
        "react-i18next": "https://esm.sh/react-i18next",
        i18next: "https://esm.sh/i18next",
        zustand: "https://esm.sh/zustand",
        mermaid: "https://esm.sh/mermaid",
        // style.css:1
        // Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/css". Strict MIME type checking is enforced for module scripts per HTML spec. "@xyflow/react": "https://esm.sh/@xyflow/react",
        // "@xyflow/react": "https://esm.sh/@xyflow/react",
        "@mui/material": "https://esm.sh/@mui/material?standalone",
        "@mui/styled-engine": "https://esm.sh/@mui/styled-engine?standalone",
        "@emotion/react": "https://esm.sh/@emotion/react",
        "@emotion/styled": "https://esm.sh/@emotion/styled",
      },
  },
});
