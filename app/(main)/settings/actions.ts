"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, updateUser } from "@/lib/queries/users";

export type SettingsState = { error?: string; success?: boolean } | null;

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "You must be logged in." };

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return {
      error: "Username must be 3-20 characters: letters, numbers, underscores.",
    };
  }
  if (bio.length > 160) return { error: "Bio must be 160 characters or less." };

  const result = await updateUser(currentUser._id, { name, username, bio });
  if (result.error) return { error: result.error };

  revalidatePath("/profile");
  return { success: true };
}