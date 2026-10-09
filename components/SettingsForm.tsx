"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/settings/actions";

type Props = {
  user: { name: string; username: string; bio?: string };
};

export default function SettingsForm({ user }: Props) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveSettings,
    null
  );

  const inputClass =
    "w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none";

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm text-gray-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={user.name}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm text-gray-300">
          Username
        </label>
        <div className="flex items-center rounded-lg border border-gray-800 bg-gray-900 focus-within:border-indigo-500">
          <span className="pl-3 text-sm text-gray-500">@</span>
          <input
            id="username"
            name="username"
            defaultValue={user.username}
            required
            className="w-full bg-transparent px-2 py-2 text-sm text-white focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm text-gray-300">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={160}
          defaultValue={user.bio ?? ""}
          placeholder="Tell people about yourself"
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-400">Settings saved.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}