import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getCurrentUserId(): Promise<string | null> {
try {
const cookieStore = await cookies();
const token = cookieStore.get("token")?.value;

if (!token) {
  return null;
}

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(secret);

const { payload } = await jwtVerify(token, secretKey, {
  algorithms: ["HS256"],
});

if (typeof payload.userId !== "string") {
  return null;
}

return payload.userId;

} catch (error) {
console.error("Failed to get current user:", error);
return null;
}
}
