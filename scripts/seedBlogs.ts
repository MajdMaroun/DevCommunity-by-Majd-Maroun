import "dotenv/config";
import mongoose from "mongoose";
import Blog from "../lib/models/Blogs";

const blogs = [
  {
    title: "Getting Started with Next.js",
    slug: "getting-started-with-nextjs",
    content:
      "Next.js is a React framework for building modern full-stack web applications. It provides routing, server components, API routes, and more.",
    author: "6ac7b5e68f4a177787bd2e45",
    image: "/images/nextjs.jpg",
  },
  {
    title: "Understanding MongoDB",
    slug: "understanding-mongodb",
    content:
      "MongoDB is a NoSQL database that stores data in flexible JSON-like documents. It works very well with modern JavaScript applications.",
    author: "PUT_USER_ID_HERE",
    image: "/images/mongodb.jpg",
  },
  {
    title: "Why TypeScript is Useful",
    slug: "why-typescript-is-useful",
    content:
      "TypeScript adds static typing to JavaScript, making large applications easier to maintain and helping developers catch errors earlier.",
    author: "PUT_USER_ID_HERE",
    image: "/images/typescript.jpg",
  },
];

async function seedBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("Connected to MongoDB");

    await Blog.deleteMany({});

    await Blog.insertMany(blogs);

    console.log("Demo blogs inserted successfully");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding blogs:", error);
    process.exit(1);
  }
}

seedBlogs();