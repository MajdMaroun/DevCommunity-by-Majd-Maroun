"use client";

import { useActionState } from "react";
import {
  createPostAction,
  type CreatePostState,
} from "@/app/(main)/create/actions";

type Props = {
  // slug is optional so existing callers keep working
  communities: { _id: string; name: string; slug?: string }[];
  // slug from /create?community=react, used to preselect the dropdown
  defaultCommunity?: string;
};

export default function CreatePostForm({ communities, defaultCommunity }: Props) {
  const [state, formAction, pending] = useActionState<CreatePostState, FormData>(
    createPostAction,
    null
  );

  const inputClass =
    "w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none";

  // Preselect the community the user came from; otherwise force a choice
  const preselected =
    communities.find((c) => c.slug === defaultCommunity)?._id ?? "";

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-gray-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          maxLength={200}
          required
          placeholder="Give your post a title"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="cover" className="mb-1.5 block text-sm text-gray-300">
          Cover image <span className="text-gray-500">(optional)</span>
        </label>
        <input
          id="cover"
          name="cover"
          type="url"
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="community" className="mb-1.5 block text-sm text-gray-300">
          Community
        </label>
        <select
          id="community"
          name="community"
          required
          defaultValue={preselected}
          className={inputClass}
        >
          <option value="" disabled>
            Select a community
          </option>
          {communities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-gray-500">
          Your post will appear only in this community.
        </p>
      </div>

      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm text-gray-300">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          required
          placeholder="Write your post..."
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="topics" className="mb-1.5 block text-sm text-gray-300">
          Topics
        </label>
        <input
          id="topics"
          name="topics"
          placeholder="nextjs, react, tailwind (max 5, comma separated)"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          name="published"
          defaultChecked
          className="h-4 w-4 accent-indigo-500"
        />
        Publish immediately (uncheck to save as draft)
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
      >
        {pending ? "Publishing..." : "Create post"}
      </button>
    </form>
  );
}