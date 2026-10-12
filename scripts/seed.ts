import { connectToDatabase } from "../lib/mongodb";
import User from "../lib/models/User";
import Community from "../lib/models/Community";
import Post from "../lib/models/Post";
import Blog from "../lib/models/blogs";

async function seed() {
  await connectToDatabase();

  console.log("Connected to MongoDB");

  await Post.deleteMany({});
  await Blog.deleteMany({});
  await Community.deleteMany({});
  await User.deleteMany({});

  const users = await User.insertMany([
    {
      name: "John Developer",
      username: "john",
      email: "john@example.com",
      bio: "Full-stack developer interested in Next.js and MongoDB.",
      skills: ["JavaScript", "React", "Next.js"],
    },
    {
      name: "Alex Davis",
      username: "alex",
      email: "alex@gmail.com",
      bio: "Software engineer and web development enthusiast.",
      skills: ["TypeScript", "Node.js", "MongoDB"],
    },
  ]);

  const blogs = await Blog.insertMany([
  {
    title: "Getting Started with Next.js",
    slug: "getting-started-with-nextjs",
    content:
      "Next.js is a React framework for building modern full-stack web applications. It provides routing, server components, API routes, and more.",
    author: users[0]._id,
    image: "/images/nextjs.jpg",
  },
  {
    title: "Understanding MongoDB",
    slug: "understanding-mongodb",
    content:
      "MongoDB is a NoSQL database that stores data in flexible JSON-like documents. It works very well with modern JavaScript applications.",
    author: users[1]._id,
    image: "/images/mongodb.jpg",
  },
  {
    title: "Why TypeScript is Useful",
    slug: "why-typescript-is-useful",
    content:
      "TypeScript adds static typing to JavaScript, making large applications easier to maintain and helping developers catch errors earlier.",
    author: users[1]._id,
    image: "/images/typescript.jpg",
  },
]);

  const communities = await Community.insertMany([
    {
      name: "Web Development",
      slug: "web-development",
      description: "A community for modern web development.",
      topics: ["React", "Next.js", "JavaScript"],
      createdBy: users[0]._id,
    },
    {
      name: "Mobile Development",
      slug: "mobile-development",
      description: "Discuss mobile apps, frameworks, and development.",
      topics: ["React Native", "Flutter", "Android"],
      createdBy: users[1]._id,
    },
    {
      name: "UI/UX Design",
      slug: "ui-ux",
      description: "Share ideas and learn about UI and UX design.",
      topics: ["UI", "UX", "Figma"],
      createdBy: users[1]._id,
    },
  ]);

  await Post.insertMany([
    {
      title: "Getting Started with Next.js",
      slug: "getting-started-with-nextjs",
      content:
        "Next.js is a React framework for building modern full-stack web applications.",
      author: users[0]._id,
      community: communities[0]._id,
      topics: ["Next.js", "React"],
      published: true,
    },
    {
      title: "Understanding TypeScript",
      slug: "understanding-typescript",
      content:
        "TypeScript adds static typing to JavaScript and can make large applications easier to maintain.",
      author: users[1]._id,
      community: communities[0]._id,
      topics: ["TypeScript", "JavaScript"],
      published: true,
    },
    {
      title: "Introduction to React Native",
      slug: "introduction-to-react-native",
      content:
        "React Native allows developers to build mobile applications using React.",
      author: users[1]._id,
      community: communities[1]._id,
      topics: ["React Native", "Mobile"],
      published: true,
    },
  ]);

  console.log("Database seeded successfully!");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});