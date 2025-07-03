import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger'; // REMOVED

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Change this to 'true' to listen on all network interfaces
    port: 8080,
  },
  plugins: [
    // dyadComponentTagger(), // REMOVED
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