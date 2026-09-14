import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { devChatApi } from "./server/dev-api";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://kartikverma.pages.dev",
  output: "static",
  compressHTML: true,
  trailingSlash: "ignore",
  build: { inlineStylesheets: "always" },
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") }), devChatApi()],
});
