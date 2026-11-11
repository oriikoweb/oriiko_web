import { NextResponse } from "next/server";
import {
  createSessionTokens,
  getDbClient,
  setSessionCookie,
  type AuthUser,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email address and passcode are required." },
        { status: 400 }
      );
    }

    const { tokenHash, signedCookie, expiresAt } = createSessionTokens();
    const supabase = getDbClient();

    const { data, error } = await supabase.rpc("login_user", {
      p_email: email,
      p_password: password,
      p_token_hash: tokenHash,
      p_expires_at: expiresAt,
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("INVALID_CREDENTIALS")) {
        return NextResponse.json(
          { error: "Invalid email address or passcode." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Authentication failed. Please try again." },
        { status: 500 }
      );
    }

    const user = (Array.isArray(data) ? data[0] : data) as AuthUser | undefined;
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email address or passcode." },
        { status: 401 }
      );
    }

    await setSessionCookie(signedCookie);

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

