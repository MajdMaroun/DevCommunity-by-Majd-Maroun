"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Follow from "@/lib/models/Follow";
import { revalidatePath } from "next/cache";
import { notify, unnotify } from "@/lib/notifications";

export async function toggleFollow(targetUserId: string) {
const session = await auth();
const currentUserId = session?.user?.id;

if (!currentUserId) {
return {
success: false,
error: "You must be logged in.",
};
}

if (currentUserId === targetUserId) {
return {
success: false,
error: "You cannot follow yourself.",
};
}

await connectToDatabase();

// Verify that the target exists without loading the entire document.
const targetExists = await User.exists({ _id: targetUserId });

if (!targetExists) {
return {
success: false,
error: "User not found.",
};
}

const existingFollow = await Follow.exists({
follower: currentUserId,
following: targetUserId,
});

// UNFOLLOW
if (existingFollow) {
const deleted = await Follow.deleteOne({
follower: currentUserId,
following: targetUserId,
});

// Only update counts and notifications if a relationship was deleted.
if (deleted.deletedCount > 0) {
  await Promise.all([
    User.updateOne(
      { _id: currentUserId },
      { $inc: { following: -1 } }
    ),
    User.updateOne(
      { _id: targetUserId },
      { $inc: { followers: -1 } }
    ),
    unnotify({
      recipient: targetUserId,
      actor: currentUserId,
      type: "follow",
    }),
  ]);
}

revalidatePath("/");
revalidatePath("/profile/[username]", "page");

return {
  success: true,
  following: false,
};

}

// FOLLOW
try {
await Follow.create({
follower: currentUserId,
following: targetUserId,
});
} catch (error: unknown) {
// Another request may have created this relationship concurrently.
if (
error &&
typeof error === "object" &&
"code" in error &&
error.code === 11000
) {
return {
success: true,
following: true,
};
}

throw error;

}

await Promise.all([
User.updateOne(
{ _id: currentUserId },
{ $inc: { following: 1 } }
),
User.updateOne(
{ _id: targetUserId },
{ $inc: { followers: 1 } }
),
notify({
recipient: targetUserId,
actor: currentUserId,
type: "follow",
dedupe: true,
}),
]);

revalidatePath("/");
revalidatePath("/profile/[username]", "page");

return {
success: true,
following: true,
};
}
