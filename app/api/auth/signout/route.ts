import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  getDbClient,
  getRawSessionTokenFromCookie,
  hashToken,
} from "@/lib/auth/session";

export async function POST() {
  try {
    const rawToken = await getRawSessionTokenFromCookie();
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      const supabase = getDbClient();
      await supabase.rpc("revoke_session", { p_token_hash: tokenHash });
    }
  } catch {
    // Still clear cookie even if DB revoke fails
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true }, { status: 200 });
}

