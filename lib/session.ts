// lib/session.ts
import { cache } from "react";
import { auth } from "@/auth";

// auth() can be called by several sections of one page. cache() makes them share
// a single session lookup per request instead of repeating it.
export const getSession = cache(async () => auth());