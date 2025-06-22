import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger"; // Supprimé pour éviter toute interférence

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      jsxRuntime: 'automatic' // Explicitement défini le runtime JSX
    }),
    // La ligne componentTagger a été supprimée pour éviter toute interférence potentielle.
    // Ajout d'un commentaire pour forcer la re-détection de la configuration.
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));