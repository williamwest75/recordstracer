import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

const readProjectEnv = () => {
  const envPath = path.resolve(__dirname, ".env");
  if (!fs.existsSync(envPath)) return {} as Record<string, string>;

  return fs
    .readFileSync(envPath, "utf-8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .reduce<Record<string, string>>((acc, line) => {
      const separatorIndex = line.indexOf("=");
      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      acc[key] = rawValue.replace(/^['"]|['"]$/g, "");
      return acc;
    }, {});
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = readProjectEnv();
  const projectId = env.VITE_SUPABASE_PROJECT_ID;
  const fixedBackendUrl = projectId
    ? `https://${projectId}.supabase.co`
    : env.VITE_SUPABASE_URL ?? "";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(fixedBackendUrl),
      ...(env.VITE_SUPABASE_PUBLISHABLE_KEY
        ? {
            "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY),
          }
        : {}),
    },
  };
});
