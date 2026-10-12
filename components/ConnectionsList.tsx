"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";

type Person = {
  _id: string;
  name: string;
  username: string;
  title?: string;
  image?: string | null;
  bio?: string;
  iFollow: boolean; // I follow them
  followedBy: boolean; // they follow me
  isMe: boolean; // this row is me
};

interface ConnectionsListProps {
  username: string;
  type: "followers" | "following";
}

export default function ConnectionsList({
  username,
  type,
}: ConnectionsListProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPeople() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/users/${username}/connections?type=${type}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load people");
        }

        const data = await response.json();

        setPeople(data.people || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadPeople();
  }, [username, type]);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  if (people.length === 0) {
    return <p className="text-sm text-gray-500">No {type} yet.</p>;
  }

  return (
    <div className="space-y-3">
      {people.map((person) => (
        <div
          key={person._id}
          className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-4"
        >
          <Link
            href={`/profile/${person.username}`}
            className="flex items-center gap-3"
          >
            {person.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.image}
                alt={person.name}
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 font-semibold">
                {person.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <p className="font-medium">{person.name}</p>

              <p className="text-sm text-gray-400">@{person.username}</p>

              {person.title && (
                <p className="text-xs text-gray-500">{person.title}</p>
              )}
            </div>
          </Link>

          {/* No follow button on my own row */}
          {!person.isMe && (
            <FollowButton
              // key forces a fresh button if the list reloads with new follow state
              key={`${person._id}-${person.iFollow}-${person.followedBy}`}
              userId={person._id}
              initialFollowing={person.iFollow}
              followedBy={person.followedBy}
            />
          )}
        </div>
      ))}
    </div>
  );
}