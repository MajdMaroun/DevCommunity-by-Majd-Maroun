import { NextResponse } from "next/server";
import Blog from "@/lib/models/blogs";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();

    const blogs = await Blog.find().sort({ createdAt: -1 });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);

    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}