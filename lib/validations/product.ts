import { z } from "zod";

export const productStatusValues = ["DRAFT", "PUBLISHED"] as const;
export const stockStatusValues = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "MADE_TO_ORDER"] as const;

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only"),
  shortDescription: z.string().max(200).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be positive"),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  categoryId: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  status: z.enum(productStatusValues).default("PUBLISHED"),
  stockStatus: z.enum(stockStatusValues).default("IN_STOCK"),
  occasion: z.string().optional().or(z.literal("")),
  flowerType: z.string().optional().or(z.literal("")),
  colour: z.string().optional().or(z.literal("")),
  size: z.string().optional().or(z.literal("")),
  deliveryEligible: z.boolean().default(true),
  images: z.array(z.object({ url: z.string(), altText: z.string().optional() })).default([]),
  collectionIds: z.array(z.string()).default([]),
  variants: z
    .array(
      z.object({
        name: z.string(),
        sku: z.string().optional(),
        price: z.coerce.number().optional(),
        stock: z.coerce.number().optional(),
      })
    )
    .default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().default(0),
  status: z.enum(productStatusValues).default("PUBLISHED"),
});

export const collectionSchema = categorySchema.extend({
  heroImage: z.string().optional().or(z.literal("")),
  tagline: z.string().max(120).optional().or(z.literal("")),
  /** OCCASION | TYPE | STYLE | FLOWER or any custom label. Stored upper-cased. */
  type: z.string().trim().min(1, "Choose or enter a collection type").max(40).transform((v) => v.toUpperCase()),
  featured: z.boolean().default(false),
  homepagePosition: z.coerce.number().int().min(1).optional().nullable(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  message: z.string().min(5, "Please enter a message"),
  interestedProduct: z.string().optional().or(z.literal("")),
  deliveryDate: z.string().optional().or(z.literal("")),
  deliveryArea: z.string().optional().or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
