import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// The credentials webserver only serves a single HTML document (and only to
// requests carrying a valid ?id=<token>), so all JS, CSS and images must be
// inlined into build/index.html. vite-plugin-singlefile does exactly that.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
  },
});
