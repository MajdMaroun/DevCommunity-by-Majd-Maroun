// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ImageModel from "@/lib/models/Image";
import { getCurrentUserId } from "@/lib/queries/auth";

export const dynamic = "force-dynamic";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // the browser shrinks images first, so this is a safety net

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG or WebP images." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 2 MB)." }, { status: 413 });
  }

  await connectToDatabase();

  const image = await ImageModel.create({
    data: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
    owner: userId,
  });

  return NextResponse.json({ url: `/api/images/${image._id}` });
}