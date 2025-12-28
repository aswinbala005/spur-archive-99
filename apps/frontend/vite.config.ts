import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    proxy: {
      // Proxy configuration for local development
      // Matches any request starting with '/api'
      "/api": {
        // Forwards it to the Backend server running on port 3000
        target: "http://localhost:3000",

        // Needed for virtual hosted sites
        changeOrigin: true,

        // Rewrite the path: removes '/api' before sending to backend.
        // Example: Frontend calls '/api/chat' -> Backend receives '/chat'
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
