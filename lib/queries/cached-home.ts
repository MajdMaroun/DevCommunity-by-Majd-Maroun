import "server-only";
import { unstable_cache } from "next/cache";
import {
  getLatestBlogs,
  getTrendingTopics,
} from "./post";

export const getCachedLatestBlogs = unstable_cache(
  async () => getLatestBlogs(3),
  ["homepage-latest-blogs"],
  {
    revalidate: 60,
    tags: ["homepage-blogs"],
  }
);

export const getCachedTrendingTopics = unstable_cache(
  async () => getTrendingTopics(5),
  ["homepage-trending-topics"],
  {
    revalidate: 60,
    tags: ["homepage-topics"],
  }
);