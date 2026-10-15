"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Code2,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  Loader2,
  Users,
  BookOpen,
} from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-gray-950 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
     setError(data.error || "Registration failed");
     return;
     }

     router.push(
     data.redirectTo ||
     `/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`
     );
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: "google" | "github") => {
    setSocialLoading(provider);
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gray-950">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

      {/* Left: branding (desktop only) */}
      <section className="relative hidden w-1/2 flex-col justify-between border-r border-gray-800 p-12 lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
            <Code2 size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">DevCommunity</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Join a community of{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              developers like you
            </span>
          </h2>
          <p className="mt-4 text-gray-400">
            Create your account in seconds and start sharing what you know.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 ring-1 ring-gray-800">
                <Users size={18} className="text-indigo-400" />
              </div>
              <span className="text-sm">Join communities around your stack</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 ring-1 ring-gray-800">
                <BookOpen size={18} className="text-indigo-400" />
              </div>
              <span className="text-sm">Bookmark posts to read later</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600">© {new Date().getFullYear()} DevCommunity</p>
      </section>

      {/* Right: form */}
      <section className="relative flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
              <Code2 size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">DevCommunity</span>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8 shadow-2xl backdrop-blur">
            <h1 className="text-2xl font-bold text-white">Create an account</h1>
            <p className="mb-6 mt-1 text-sm text-gray-400">
              Join the developer community
            </p>

            {/* Social sign-up */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocial("google")}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 py-2.5 text-sm font-medium text-white transition hover:border-gray-600 hover:bg-gray-800 disabled:opacity-50"
              >
                {socialLoading === "google" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocial("github")}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 py-2.5 text-sm font-medium text-white transition hover:border-gray-600 hover:bg-gray-800 disabled:opacity-50"
              >
                {socialLoading === "github" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <GitHubIcon />
                )}
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-800" />
              <span className="text-xs uppercase tracking-wide text-gray-500">
                or sign up with email
              </span>
              <div className="h-px flex-1 bg-gray-800" />
            </div>

            {/* Email form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Enter your name..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="Enter your username..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}