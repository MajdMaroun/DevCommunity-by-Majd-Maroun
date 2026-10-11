"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/(main)/settings/actions";

type Props = {
  user: {
    name: string;
    username: string;
    bio?: string;
    settings?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      weeklyDigest?: boolean;
      privateAccount?: boolean;
      showActivityStatus?: boolean;
      theme?: "system" | "dark" | "light";
      language?: string;
    };
  };
};

const inputClass =
  "w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-gray-800 pt-6 first:border-t-0 first:pt-0">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm text-gray-200">{label}</span>
        {description && (
          <span className="block text-xs text-gray-500">{description}</span>
        )}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-gray-700 transition peer-checked:bg-indigo-500 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function SettingsForm({ user }: Props) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveSettings,
    null
  );
  const s = user.settings ?? {};

  return (
    <form action={formAction} className="space-y-8">

      {/* Notifications */}
      <Section title="Notifications" description="Choose what you hear about.">
        <Toggle
          name="emailNotifications"
          label="Email notifications"
          description="Replies, mentions, and account activity."
          defaultChecked={s.emailNotifications ?? true}
        />
        <Toggle
          name="pushNotifications"
          label="Push notifications"
          description="Get alerts on your devices."
          defaultChecked={s.pushNotifications ?? false}
        />
        <Toggle
          name="weeklyDigest"
          label="Weekly digest"
          description="A summary of what you missed."
          defaultChecked={s.weeklyDigest ?? true}
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy" description="Control who can see what.">
        <Toggle
          name="privateAccount"
          label="Private account"
          description="Only approved followers can see your posts."
          defaultChecked={s.privateAccount ?? false}
        />
        <Toggle
          name="showActivityStatus"
          label="Show activity status"
          description="Let others see when you're online."
          defaultChecked={s.showActivityStatus ?? true}
        />
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <div>
          <label htmlFor="theme" className="mb-1.5 block text-sm text-gray-300">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            defaultValue={s.theme ?? "system"}
            className={inputClass}
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="mb-1.5 block text-sm text-gray-300">
            Language
          </label>
          <select
            id="language"
            name="language"
            defaultValue={s.language ?? "en"}
            className={inputClass}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>
      </Section>

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