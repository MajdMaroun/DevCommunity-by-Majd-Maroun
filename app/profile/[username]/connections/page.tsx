import Link from "next/link";
import ConnectionsList from "@/components/ConnectionsList"
export default async function ConnectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { username } = await params;
  const { type } = await searchParams;

  const connectionType =
    type === "following" ? "following" : "followers";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-white">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/profile/${username}`}
          className="text-gray-400 hover:text-white"
        >
          ←
        </Link>

        <h1 className="text-2xl font-bold">
          {connectionType === "followers"
            ? "Followers"
            : "Following"}
        </h1>
      </div>

      <ConnectionsList
        username={username}
        type={connectionType}
      />
    </div>
  );
}