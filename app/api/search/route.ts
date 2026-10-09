import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Blog from "@/lib/models/Blogs";
import Community from "@/lib/models/Community";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({
        users: [],
        blogs: [],
        communities: [],
      });
    }

    await connectToDatabase();

    const regex = new RegExp(q, "i");

    const [users, blogs, communities] = await Promise.all([
      User.find({
        $or: [
          { name: regex },
          { username: regex },
        ],
      })
        .select("_id name username avatar")
        .limit(5),

      Blog.find({
        $or: [
          { title: regex },
          { content: regex },
        ],
      })
        .select("_id title slug")
        .limit(5),

      Community.find({
        $or: [
          { name: regex },
          { description: regex },
        ],
      })
        .select("_id name slug")
        .limit(5),
    ]);

    return NextResponse.json({
      users,
      blogs,
      communities,
    });
  } catch (error) {
    console.error("Search error:", error);

    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}