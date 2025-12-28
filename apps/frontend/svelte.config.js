import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Enables TypeScript inside .svelte files
  preprocess: vitePreprocess(),

  kit: {
    // Adapter for Vercel/Node
    adapter: adapter(),

    // We removed the explicit 'files' object because it's deprecated.
    // SvelteKit automatically finds 'src/routes', 'static', etc.
  },
};

export default config;
