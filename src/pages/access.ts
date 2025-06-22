import type { APIRoute } from "astro";
import { TRAVEL_ACCESS_KEY } from "astro:env/server";
import { parseAccessKeys } from "../util";

export const prerender = false;

/**
 * This endpoint sets the `Access-Key` cookie when hit from the form defined in
 * `AccessKeyProtectedPage.astro`. Astro makes it somewhat difficult to set cookie values
 * directly, so this little bit of indirection is needed in order to ensure that the right
 * value is both set, and set persistently.
 */
export const POST: APIRoute = async (context) => {
    const data = await context.request.formData();
    const newKey = data.get("accessKey")?.toString();
    const originPath = data.get("originPath")?.toString();

    if (originPath == undefined) {
        console.warn(
            "originPath is undefined. Some access protected resource is not playing nice.",
        );
    }

    if (newKey != undefined) {
        try {
            const validAccessKeys = new Set([TRAVEL_ACCESS_KEY]);
            if (!validAccessKeys.has(newKey)) {
                throw new Error("Invalid or missing submitted key");
            }

            const accessKeys: Set<string> = new Set(parseAccessKeys(context.cookies));
            accessKeys.add(newKey);

            context.cookies.set("Access-Key", JSON.stringify([...accessKeys]));
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
        }
    }
    return context.redirect(originPath ?? "/404");
};
