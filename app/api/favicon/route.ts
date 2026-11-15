import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { fetchStoreBootstrap } from "@/lib/store/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { settings } = await fetchStoreBootstrap();
  if (settings.faviconUrl) {
    return NextResponse.redirect(settings.faviconUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  try {
    const svgPath = path.join(process.cwd(), "public", "favicon.svg");
    const svg = await fs.readFile(svgPath);
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

