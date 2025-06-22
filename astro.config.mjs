import { defineConfig, envField } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    site: "https://www.jarodg.dev",

    image: {
        domains: ["images.jarodg.dev"],
    },

    adapter: cloudflare(),
    env: {
        schema: {
            TRAVEL_ACCESS_KEY: envField.string({
                context: "server",
                access: "secret",
            }),
        },
    },
});
