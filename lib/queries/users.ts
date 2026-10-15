import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function updateUser(
id: string,
data: {
name: string;
username: string;
bio: string;
title?: string;
}
): Promise<{ error?: string }> {
await connectToDatabase();

const taken = await User.findOne({
username: data.username,
_id: { $ne: id },
}).lean();

if (taken) {
return { error: "Username is already taken." };
}

const updated = await User.findByIdAndUpdate(
id,
{
$set: {
name: data.name,
username: data.username,
bio: data.bio,
title: data.title?.trim() ?? "",
},
},
{ new: true }
);

if (!updated) {
return { error: "User not found." };
}

return {};
}

export async function getUserByUsername(username: string) {
await connectToDatabase();

const user = await User.findOne({
username: username.toLowerCase(),
})
.select("name username title image bio followers following")
.lean();

if (!user) {
return null;
}

return JSON.parse(JSON.stringify(user)) as {
_id: string;
name: string;
username?: string;
title?: string;
image?: string | null;
bio?: string;
followers?: number;
following?: number;
};
}

export async function getCurrentUser() {
const session = await auth();
const id = session?.user?.id;

if (!id) {
return null;
}

await connectToDatabase();

const dbUser = await User.findById(id)
.select("-password")
.lean();

return {
...(dbUser ?? {}),
_id: id,
name: dbUser?.name ?? session.user.name ?? "",
email: dbUser?.email ?? session.user.email ?? "",
title: dbUser?.title ?? "",
image: dbUser
? dbUser.image || null
: session.user.image ?? null,
};
}
