/**
 * Catch-all API proxy route.
 *
 * Every browser-side request to /api/v1/* is forwarded to the FastAPI backend
 * on Render, preserving method, headers (Authorization), query-string, and body.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://ncl-nexacargologistics-2.onrender.com";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const target = `${BACKEND}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  // Forward auth + content-type headers
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  // Forward body for non-GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  try {
    const upstream = await fetch(target, init);
    const body = await upstream.arrayBuffer();

    const resHeaders = new Headers();
    // Forward relevant response headers
    const resCt = upstream.headers.get("content-type");
    if (resCt) resHeaders.set("content-type", resCt);

    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("[API Proxy] upstream error:", err);
    return NextResponse.json(
      { detail: "Backend service unavailable. Please try again." },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

export const runtime = "edge";
