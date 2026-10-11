import { connectToDatabase } from "../mongodb";
import Post from "../models/Post";
import User from "../models/User";
import Community from "../models/Community";

export async function getLatestPosts() {
  await connectToDatabase();

  const posts = await Post.find({ published: true })
    .populate({
      path: "author",
      model: User,
      select: "name username",
    })
    .populate({
      path: "community",
      model: Community,
      select: "name slug",
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return posts;
}


export async function getPostBySlug(slug: string) {
  await connectToDatabase();

  const post = await Post.findOne({ slug })
    .populate({ path: "author", model: User, select: "name username image" })
    .populate({ path: "community", model: Community, select: "name slug" })
    .lean();

  if (!post) return null;

  return JSON.parse(JSON.stringify(post)) as {
    _id: string;
    title: string;
    slug: string;
    content: string;
    cover?: string;
    topics: string[];
    published: boolean;
    createdAt: string;
    author: { _id: string; name: string; username?: string; image?: string | null };
    community?: { name: string; slug: string };
  };
}

export async function getPostsByAuthor(userId: string, includeDrafts = false) {
  await connectToDatabase();

  const posts = await Post.find({
    author: userId, // Mongoose casts the string to an ObjectId
    ...(includeDrafts ? {} : { published: true }),
  })
    .populate({ path: "community", model: Community, select: "name slug" })
    .sort({ createdAt: -1 })
    .lean();

  // plain JSON so it can be passed to client components
  return JSON.parse(JSON.stringify(posts)) as {
    _id: string;
    title: string;
    slug: string;
    content: string;
    cover?: string;
    topics: string[];
    published: boolean;
    createdAt: string;
    community?: { name: string; slug: string };
  }[];
}

export async function getPostsByCommunity(communityId: string) {
  await connectToDatabase();

  const posts = await Post.find({ community: communityId, published: true })
    .populate({ path: "author", model: User, select: "name username image" })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(posts)) as {
    _id: string;
    title: string;
    slug: string;
    content: string;
    cover?: string;
    topics: string[];
    createdAt: string;
    author?: { name: string; username?: string; image?: string | null };
  }[];
}

export async function getCommunityOptions() {
  await connectToDatabase();

  const communities = await Community.find().select("name slug").sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(communities)) as {
    _id: string;
    name: string;
    slug: string;
  }[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPost(data: {
  title: string;
  content: string;
  cover?: string;
  community: string;
  author: string;
  topics: string[];
  published: boolean;
}) {
  await connectToDatabase();

  // Random suffix keeps the unique slug from colliding on duplicate titles
  const slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 7)}`;

  const post = await Post.create({ ...data, slug });
  return { slug: post.slug };
}