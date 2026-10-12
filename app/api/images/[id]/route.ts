import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import ImageModel from "@/lib/models/Image";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  await connectToDatabase();
  const image = await ImageModel.findById(id);
  if (!image) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      // An uploaded image never changes, so browsers can cache it for a year
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}