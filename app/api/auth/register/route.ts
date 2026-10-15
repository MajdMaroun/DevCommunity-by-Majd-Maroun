import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import PendingRegistration from "@/lib/models/PendingRegistration";
import EmailVerification from "@/lib/models/EmailVerification";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
try {
const { name, username, email, password } = await request.json();


if (
  typeof name !== "string" ||
  typeof username !== "string" ||
  typeof email !== "string" ||
  typeof password !== "string" ||
  !name.trim() ||
  !username.trim() ||
  !email.trim() ||
  !password
) {
  return NextResponse.json(
    { error: "All fields are required" },
    { status: 400 }
  );
}

const normalizedName = name.trim();
const normalizedUsername = username.trim().toLowerCase();
const normalizedEmail = email.trim().toLowerCase();

if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
  return NextResponse.json(
    { error: "Username must be 3–30 characters and contain only letters, numbers, and underscores." },
    { status: 400 }
  );
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
  return NextResponse.json(
    { error: "Enter a valid email address." },
    { status: 400 }
  );
}

if (password.length < 8) {
  return NextResponse.json(
    { error: "Password must be at least 8 characters." },
    { status: 400 }
  );
}

await connectToDatabase();

const existingUser = await User.findOne({
  $or: [
    { email: normalizedEmail },
    { username: normalizedUsername },
  ],
  emailVerified: { $ne: null },
}).select("_id");

if (existingUser) {
  return NextResponse.json(
    { error: "Email or username already exists" },
    { status: 409 }
  );
}

const conflictingPending = await PendingRegistration.findOne({
  $or: [
    { email: normalizedEmail },
    { username: normalizedUsername },
  ],
  expiresAt: { $gt: new Date() },
}).select("email username");

if (
  conflictingPending &&
  conflictingPending.email !== normalizedEmail &&
  conflictingPending.username === normalizedUsername
) {
  return NextResponse.json(
    { error: "Username is currently pending verification. Try another username or use the same email to restart registration." },
    { status: 409 }
  );
}

// Remove expired or replaceable pending registrations for this email.
await PendingRegistration.deleteMany({
  $or: [
    { email: normalizedEmail },
    { expiresAt: { $lte: new Date() } },
  ],
});

// Remove any old verification code for this email.
await EmailVerification.deleteOne({ email: normalizedEmail });

const hashedPassword = await bcrypt.hash(password, 10);
const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

await PendingRegistration.create({
  name: normalizedName,
  username: normalizedUsername,
  email: normalizedEmail,
  password: hashedPassword,
  expiresAt,
});

const verificationCode = crypto
  .randomInt(100000, 1000000)
  .toString();

const secret =
  process.env.VERIFICATION_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET;

if (!secret) {
  await PendingRegistration.deleteOne({ email: normalizedEmail });

  return NextResponse.json(
    { error: "Email verification is not configured." },
    { status: 500 }
  );
}

const { createHmac } = await import("crypto");
const codeHash = createHmac("sha256", secret)
  .update(`${normalizedEmail}:${verificationCode}`)
  .digest("hex");

await EmailVerification.create({
  email: normalizedEmail,
  codeHash,
  attempts: 0,
  expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
  lastSentAt: new Date(),
});

try {
  await sendVerificationEmail(normalizedEmail, verificationCode);
} catch (error) {
  console.error("Verification email failed:", error);

  await Promise.all([
    PendingRegistration.deleteOne({ email: normalizedEmail }),
    EmailVerification.deleteOne({ email: normalizedEmail }),
  ]);

  return NextResponse.json(
    { error: "We couldn't send the verification email. Please try registering again." },
    { status: 500 }
  );
}

return NextResponse.json(
  {
    message: "Registration started. Please verify your email.",
    redirectTo: `/verify?email=${encodeURIComponent(normalizedEmail)}`,
  },
  { status: 201 }
);

} catch (error) {
console.error("Register error:", error);

if (
  error &&
  typeof error === "object" &&
  "code" in error &&
  error.code === 11000
) {
  return NextResponse.json(
    { error: "That email or username is already being registered. Please try again." },
    { status: 409 }
  );
}

return NextResponse.json(
  { error: "Something went wrong. Please try again." },
  { status: 500 }
);

}
}
