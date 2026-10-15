"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendVerificationCode, verifyEmailCode } from "@/app/actions/verification";

export default function VerifyForm({
  email,
  autoSend,
}: {
  email: string;
  autoSend: boolean; // send a code as soon as the page opens (after register or a blocked login)
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();
  const sentOnce = useRef(false);

  async function send(isAuto = false) {
    setError("");
    const res = await sendVerificationCode(email);

    if (res.ok) {
      setInfo(`We sent a 6-digit code to ${email}.`);
      setCooldown(60);
      return;
    }

    if (res.retryAfter) {
      setCooldown(res.retryAfter);
      // On the automatic send, a cooldown just means the code was sent a moment ago
      if (isAuto) setInfo(`We sent a 6-digit code to ${email}.`);
      else setError(res.error);
      return;
    }

    setError(res.error);
  }

  // Send once when the page opens (the ref stops React's double effect in development)
  useEffect(() => {
    if (autoSend && !sentOnce.current) {
      sentOnce.current = true;
      void send(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count down the resend timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function submit(value: string) {
    setError("");
    startTransition(async () => {
      const res = await verifyEmailCode(email, value);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setVerified(true);
      setInfo("Email verified! Taking you to log in...");
      window.setTimeout(() => router.push("/login?verified=1"), 900);
    });
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    // Verify automatically once all six digits are in (typed or pasted)
    if (digits.length === 6 && !pending) submit(digits);
  }

  return (
    <div className="space-y-5">
      <div>
        <input
          value={code}
          onChange={onChange}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="000000"
          disabled={pending || verified}
          aria-label="6-digit verification code"
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-4 text-center text-3xl font-bold tracking-[0.5em] text-white placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
        />
      </div>

      <button
        type="button"
        onClick={() => submit(code)}
        disabled={pending || verified || code.length !== 6}
        className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
      >
        {pending ? "Checking..." : verified ? "Verified" : "Verify email"}
      </button>

      <div className="min-h-[2.5rem] text-center text-sm" role="status">
        {error && <p className="text-red-400">{error}</p>}
        {!error && info && <p className={verified ? "text-green-400" : "text-slate-400"}>{info}</p>}
      </div>

      {!verified && (
        <p className="text-center text-sm text-slate-500">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={() => send()}
            disabled={cooldown > 0}
            className="font-medium text-indigo-400 transition hover:text-indigo-300 disabled:text-slate-600"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>
      )}
    </div>
  );
}