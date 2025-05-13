import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Removed componentTagger import which may use newer JS features

// https://vitejs.dev/config/
export default defineConfig(function(config) {
  const mode = config.mode;
  return {
    server: {
      host: "localhost", // Changed from '::' to 'localhost' for better compatibility
      port: 8080,
    },
    plugins: [
      react(),
      // Removed componentTagger which may use newer JS features
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
