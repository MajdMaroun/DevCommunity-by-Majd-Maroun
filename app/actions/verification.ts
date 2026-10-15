"use server";

import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import PendingRegistration from "@/lib/models/PendingRegistration";
import EmailVerification from "@/lib/models/EmailVerification";
import { sendVerificationEmail } from "@/lib/mail";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

const clean = (email: string) => email.trim().toLowerCase();

function hashCode(email: string, code: string) {
const secret =
process.env.VERIFICATION_SECRET ||
process.env.AUTH_SECRET ||
process.env.JWT_SECRET;

if (!secret) {
throw new Error("Set AUTH_SECRET or VERIFICATION_SECRET in .env.local");
}

return createHmac("sha256", secret)
.update(`${email}:${code}`)
.digest("hex");
}

export type SendResult =
| { ok: true }
| { ok: false; error: string; retryAfter?: number };

export async function sendVerificationCode(
emailInput: string
): Promise<SendResult> {
const email = clean(emailInput);

if (!EMAIL_RE.test(email)) {
return { ok: false, error: "Enter a valid email address." };
}

await connectToDatabase();

const pending = await PendingRegistration.findOne({
email,
expiresAt: { $gt: new Date() },
}).select("+password");

if (!pending) {
const existingUser = await User.findOne({ email }).select("emailVerified");

if (existingUser?.emailVerified) {
  return {
    ok: false,
    error: "This email is already verified. You can log in.",
  };
}

return {
  ok: false,
  error: "Registration not found or expired. Please register again.",
};

}

const existing = await EmailVerification.findOne({ email });

if (existing) {
const wait =
RESEND_COOLDOWN_MS -
(Date.now() - new Date(existing.lastSentAt).getTime());

if (wait > 0) {
  const retryAfter = Math.ceil(wait / 1000);
  return {
    ok: false,
    error: `Please wait ${retryAfter}s before requesting another code.`,
    retryAfter,
  };
}

}

const code = String(randomInt(100000, 1000000));
const now = Date.now();

await EmailVerification.findOneAndUpdate(
{ email },
{
codeHash: hashCode(email, code),
attempts: 0,
expiresAt: new Date(now + CODE_TTL_MS),
lastSentAt: new Date(now),
},
{ upsert: true, new: true }
);

try {
await sendVerificationEmail(email, code);
} catch (error) {
console.error("Could not send verification email:", error);
await EmailVerification.deleteOne({ email });
return {
ok: false,
error: "We couldn't send the email. Please try again.",
};
}

return { ok: true };
}

export async function verifyEmailCode(
emailInput: string,
codeInput: string
): Promise<{ ok: true } | { ok: false; error: string }> {
const email = clean(emailInput);
const code = codeInput.replace(/\s/g, "");

if (!EMAIL_RE.test(email)) {
return { ok: false, error: "Enter a valid email address." };
}

if (!/^\d{6}$/.test(code)) {
return { ok: false, error: "Enter the 6-digit code." };
}

await connectToDatabase();

const record = await EmailVerification.findOne({ email });

if (!record || record.expiresAt.getTime() < Date.now()) {
await EmailVerification.deleteOne({ email });
return {
ok: false,
error: "That code has expired. Request a new one.",
};
}

if (record.attempts >= MAX_ATTEMPTS) {
await EmailVerification.deleteOne({ email });
return {
ok: false,
error: "Too many wrong attempts. Request a new code.",
};
}

const expected = Buffer.from(record.codeHash, "hex");
const actual = Buffer.from(hashCode(email, code), "hex");

const matches =
expected.length === actual.length &&
timingSafeEqual(expected, actual);

if (!matches) {
record.attempts += 1;
await record.save();

const left = MAX_ATTEMPTS - record.attempts;

return {
  ok: false,
  error:
    left > 0
      ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.`
      : "Too many wrong attempts. Request a new code.",
};

}

const pending = await PendingRegistration.findOne({
email,
expiresAt: { $gt: new Date() },
}).select("+password");

if (!pending) {
await EmailVerification.deleteOne({ email });
return {
ok: false,
error: "Registration expired. Please register again.",
};
}

const existingUser = await User.findOne({
$or: [{ email }, { username: pending.username }],
}).select("_id email username");

if (existingUser) {
// Allow an already verified account with this email to remain intact.
if (existingUser.email === email) {
await PendingRegistration.deleteOne({ email });
await EmailVerification.deleteOne({ email });

  return {
    ok: false,
    error: "An account with this email already exists. Please log in.",
  };
}

await EmailVerification.deleteOne({ email });
return {
  ok: false,
  error: "This username is already taken. Please register with another username.",
};

}

try {
await User.create({
name: pending.name,
username: pending.username,
email: pending.email,
password: pending.password,
title: pending.title || "Developer",
emailVerified: new Date(),
});

await Promise.all([
  PendingRegistration.deleteOne({ email }),
  EmailVerification.deleteOne({ email }),
]);

return { ok: true };

} catch (error) {
if (
error &&
typeof error === "object" &&
"code" in error &&
error.code === 11000
) {
return {
ok: false,
error: "That email or username is already taken. Please try again.",
};
}

console.error("Email verification error:", error);

return {
  ok: false,
  error: "Verification failed. Please try again.",
};

}
}
