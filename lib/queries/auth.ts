import { auth } from "@/auth";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}