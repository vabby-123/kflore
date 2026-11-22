import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import sharp from "sharp";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/** Longest edge we keep for originals. Storefront images are served through next/image at ≤ 1920px anyway. */
const MAX_EDGE = 2400;
const THUMB_EDGE = 480;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  filename: string;
  width: number;
  height: number;
}

const EXT_BY_FORMAT: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif" };

/**
 * Validates and stores an uploaded image.
 *  - the file's real format is sniffed by sharp (the browser-supplied MIME type is not trusted);
 *  - EXIF rotation is applied, oversized originals are downscaled to 2400px on the long edge;
 *  - a 480px WebP thumbnail is generated so admin grids never load full-size originals;
 *  - with Cloudinary configured both files go to its CDN, otherwise to /public/uploads.
 */
export async function saveUploadedImage(file: File): Promise<UploadResult> {
  const input = Buffer.from(await file.arrayBuffer());

  const meta = await sharp(input).metadata();
  const format = meta.format ?? "";
  if (!(format in EXT_BY_FORMAT)) throw new Error("Unsupported image format");

  const pipeline = sharp(input).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  const { data, info } = await (format === "jpeg"
    ? pipeline.jpeg({ quality: 86, mozjpeg: true })
    : format === "png"
      ? pipeline.png({ compressionLevel: 9 })
      : format === "webp"
        ? pipeline.webp({ quality: 86 })
        : pipeline.avif({ quality: 60 })
  ).toBuffer({ resolveWithObject: true });

  const thumb = await sharp(data).resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();

  const base = randomUUID();
  const filename = `${base}.${EXT_BY_FORMAT[format]}`;
  const thumbName = `${base}-thumb.webp`;

  if (cloudinaryConfigured) {
    const original = await uploadToCloudinary(data, filename, `image/${format}`);
    return {
      url: original,
      // Cloudinary derives the thumbnail on the fly, so nothing extra to store.
      thumbnailUrl: original.replace("/upload/", `/upload/c_limit,w_${THUMB_EDGE},f_auto,q_auto/`),
      filename,
      width: info.width,
      height: info.height,
    };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await Promise.all([writeFile(join(UPLOAD_DIR, filename), data), writeFile(join(UPLOAD_DIR, thumbName), thumb)]);
  return { url: `/uploads/${filename}`, thumbnailUrl: `/uploads/${thumbName}`, filename, width: info.width, height: info.height };
}

async function uploadToCloudinary(bytes: Buffer, filename: string, contentType: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.round(Date.now() / 1000);
  const signature = createHash("sha1").update(`timestamp=${timestamp}${apiSecret}`).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type: contentType }), filename);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { secure_url: string };
  return json.secure_url;
}

export function isCloudinaryConfigured() {
  return cloudinaryConfigured;
}
