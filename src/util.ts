import type { AstroCookies } from "astro";

export function parseAccessKeys(cookies: AstroCookies): string[] {
    return cookies.get("Access-Key")?.json() ?? [];
}
