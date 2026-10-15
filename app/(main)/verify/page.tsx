import Link from "next/link";
import { redirect } from "next/navigation";
import VerifyForm from "@/components/VerifyForm";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; send?: string }>;
}) {
  const { email, send } = await searchParams;
  if (!email) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12 text-white">
      <div className="w-full rounded-2xl border border-slate-800 bg-[#0f1629] p-8 shadow-2xl shadow-black/30">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mb-6 mt-2 text-sm leading-6 text-slate-400">
          Enter the 6-digit code we emailed to{" "}
          <span className="font-medium text-slate-200">{email}</span>. It expires in 10 minutes.
        </p>

        <VerifyForm email={email} autoSend={send === "1"} />

        <p className="mt-6 text-center text-sm text-slate-500">
          Wrong email?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
            Start again
          </Link>
        </p>
      </div>
    </main>
  );
}