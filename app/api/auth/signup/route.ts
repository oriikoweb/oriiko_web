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
    const fullName =
      typeof body?.fullName === "string" ? body.fullName.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passcode must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Please provide your full name." },
        { status: 400 }
      );
    }

    const { tokenHash, signedCookie, expiresAt } = createSessionTokens();
    const supabase = getDbClient();

    const { data, error } = await supabase.rpc("register_user", {
      p_email: email,
      p_password: password,
      p_full_name: fullName,
      p_token_hash: tokenHash,
      p_expires_at: expiresAt,
    });

    if (error) {
      console.error("[auth/signup] RPC error:", error);
      const msg = error.message || "";
      if (msg.includes("EMAIL_ALREADY_EXISTS")) {
        return NextResponse.json(
          { error: "An ORIIKO account with this email already exists." },
          { status: 409 }
        );
      }
      if (msg.includes("INVALID_EMAIL")) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }
      if (msg.includes("WEAK_PASSWORD")) {
        return NextResponse.json(
          { error: "Passcode must be at least 6 characters in length." },
          { status: 400 }
        );
      }
      if (error.code === "PGRST202") {
        return NextResponse.json(
          {
            error:
              "Database signup function (register_user) is missing or schema cache needs reload.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Unable to create account. Please try again." },
        { status: 500 }
      );
    }

    const user = (Array.isArray(data) ? data[0] : data) as AuthUser | undefined;
    if (!user) {
      return NextResponse.json(
        { error: "Account created, but session initialization failed." },
        { status: 500 }
      );
    }

    await setSessionCookie(signedCookie);

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

