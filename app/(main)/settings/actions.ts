"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";                 // your next-auth v5 config file
import { connectToDatabase } from "@/lib/mongodb";     // your existing connection helper
import User from "@/lib/models/User";              // your User model

export type SettingsState = { error?: string; success?: boolean } | null;

const schema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
  privateAccount: z.boolean(),
  showActivityStatus: z.boolean(),
  theme: z.enum(["system", "dark", "light"]),
  language: z.enum(["en", "ar", "fr", "es"]),
});

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const parsed = schema.safeParse({
    emailNotifications: formData.get("emailNotifications") === "on",
    pushNotifications: formData.get("pushNotifications") === "on",
    weeklyDigest: formData.get("weeklyDigest") === "on",
    privateAccount: formData.get("privateAccount") === "on",
    showActivityStatus: formData.get("showActivityStatus") === "on",
    theme: formData.get("theme"),
    language: formData.get("language"),
  });

  if (!parsed.success) return { error: "Invalid settings." };

  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(session.user.id, {
      $set: { settings: parsed.data },
    });
  } catch {
    return { error: "Could not save settings. Try again." };
  }

  const jar = await cookies();
  const opts = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };
  jar.set("theme", parsed.data.theme, opts);
  jar.set("lang", parsed.data.language, opts);

  revalidatePath("/", "layout");
  return { success: true };
}