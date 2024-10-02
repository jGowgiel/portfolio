import { defineCollection, z } from "astro:content";

const coreSchema = z.object({
    title: z.string(),
    author: z.string(),
    date: z.string().date(),
    image: z
        .object({
            src: z.string().url(),
            alt: z.string(),
        })
        .optional(),
});

const blogCollection = defineCollection({
    type: "content",
    schema: coreSchema,
});

const travelCollection = defineCollection({
    type: "content",
    schema: coreSchema,
});

export const collections = {
    blog: blogCollection,
    travel: travelCollection,
};
