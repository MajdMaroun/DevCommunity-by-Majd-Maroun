import { notFound, redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { getCurrentUser, getUserByUsername } from "@/lib/queries/users";
import { getPostsByAuthor } from "@/lib/queries/post";
import { getRelationship } from "@/lib/queries/follow";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
params,
}: {
params: Promise<{ username: string }>;
}) {
const { username: rawUsername } = await params;

let username = rawUsername;

try {
username = decodeURIComponent(rawUsername);
} catch {
// Keep the original username if decoding fails.
}

const user = await getUserByUsername(username);

if (!user) {
notFound();
}

const me = await getCurrentUser();

if (me && String(me._id) === String(user._id)) {
redirect("/profile");
}

const posts = await getPostsByAuthor(user._id, false);

const relationship = await getRelationship(
me?._id ?? null,
user._id
);

return (
<ProfileView
user={{
...user,
title: user.title?.trim() ?? "",
}}
posts={posts}
relationship={relationship}
/>
);
}
