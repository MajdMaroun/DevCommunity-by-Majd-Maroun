import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";


export async function updateUser(
  id: string,
  data: { name: string; username: string; bio: string }
): Promise<{ error?: string }> {
  await connectToDatabase();

  const taken = await User.findOne({
    username: data.username,
    _id: { $ne: id },
  }).lean();
  if (taken) return { error: "Username is already taken." };

  const updated = await User.findByIdAndUpdate(
    id,
    { $set: { name: data.name, username: data.username, bio: data.bio } },
    { new: true }
  );
  if (!updated) return { error: "User not found." };

  return {};
}

export async function getCurrentUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  await connectToDatabase();
  const dbUser = await User.findById(id).lean();

  // Fall back to session data if the DB record is missing fields
  return {
    ...(dbUser ?? {}),
    _id: id,
    name: dbUser?.name ?? session.user.name ?? "",
    email: dbUser?.email ?? session.user.email ?? "",
    image:
      (dbUser as (NonNullable<typeof dbUser> & { image?: string | null }) | null)
        ?.image ??
      session.user.image ??
      null,
  };
}