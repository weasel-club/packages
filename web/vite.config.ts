import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const LISTING_URL =
  process.env.LISTING_URL ?? "https://weasel-club.github.io/packages/index.json";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/packages/" : "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "dev-listing-json",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url !== "/index.json") {
            next();
            return;
          }
          const upstream = await fetch(LISTING_URL);
          res.statusCode = upstream.status;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(await upstream.text());
        });
      },
    },
  ],
});
