import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, saveUploadedImage } from "@/lib/storage";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, WebP or AVIF image" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  try {
    const result = await saveUploadedImage(file);
    const [record] = await db
      .insert(media)
      .values({
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        filename: file.name,
        width: result.width,
        height: result.height,
      })
      .returning();
    return NextResponse.json({ url: result.url, thumbnailUrl: result.thumbnailUrl, width: result.width, height: result.height, id: record.id });
  } catch (err) {
    console.error("[upload] failed", err);
    const message = err instanceof Error && err.message === "Unsupported image format" ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: message === "Upload failed" ? 500 : 400 });
  }
}
