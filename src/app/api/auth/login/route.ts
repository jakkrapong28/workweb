import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { badRequest } from "@/lib/api";

// Used when the account does not exist so failed logins take a comparable
// amount of time and do not reveal valid usernames through timing differences.
const DUMMY_PASSWORD_HASH =
  "$2b$10$RyMBEd9gEME9GhrIT7rruuUcchnuWoqoKWJcWgzW/PDF6i2hIYi3.";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }

  await dbConnect();
  const admin = await Admin.findOne({ username: parsed.data.username });
  const ok = await bcrypt.compare(
    parsed.data.password,
    admin?.passwordHash ?? DUMMY_PASSWORD_HASH
  );

  if (!admin || !ok) {
    return NextResponse.json(
      { error: "username หรือ password ไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    sub: String(admin._id),
    username: admin.username,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, username: admin.username });
}
