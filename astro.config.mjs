// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  vite: {
    ssr: {
      external: ['sharp'],
    },
  },
  site: "https://william.bernting.se",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "sv",
        locales: {
          sv: "sv-SE",
          en: "en-US",
        },
      },
    }),
  ],
  i18n: {
    locales: ["sv", "en"],
    defaultLocale: "sv",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
