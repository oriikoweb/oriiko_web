import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  // Placeholder endpoint reserved for future Google OAuth callback handling
  return NextResponse.redirect(`${origin}/auth`);
}
