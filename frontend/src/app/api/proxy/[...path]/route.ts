import { NextRequest, NextResponse } from "next/server";

function getBackendBase(): string {
  const defaultUrl = process.env.VERCEL ? "https://ncl-nexacargologistics-2.onrender.com/api/v1" : "http://127.0.0.1:8000/api/v1";
  let raw = (process.env.BACKEND_API_URL || defaultUrl).trim().replace(/\/+$/, "");
  if (!raw.endsWith("/api/v1") && !raw.includes("/api/")) {
    raw = `${raw}/api/v1`;
  }
  return raw;
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  let path: string[];
  try {
    ({ path } = await params);
  } catch {
    return NextResponse.json({ detail: "Invalid route params" }, { status: 400 });
  }

  const backendBase = getBackendBase();
  const url = `${backendBase}/${path.join("/")}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};

  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try { body = await req.text(); } catch { body = undefined; }
  }

  // Retry fetch up to 2 times for 502/503/504 errors (Render free tier cold-start spin-up)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50s timeout to beat Vercel's 60s hard limit
      const res = await fetch(url, { method: req.method, headers, body, signal: controller.signal });
      clearTimeout(timeoutId);
      
      if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }
      const data = await res.text();
      if (!res.ok) {
        // Surface the backend error in Vercel function logs
        console.error(
          `[proxy] ${req.method} ${url} → HTTP ${res.status}\n` +
          `Backend response: ${data.slice(0, 500)}`
        );
      }
      return new NextResponse(data, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
      });
    } catch (err) {
      console.error(`[proxy] ${req.method} ${url} attempt ${attempt} threw:`, err);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }
      const message = err instanceof Error ? err.message : "Backend unreachable";
      return NextResponse.json({ detail: `Proxy error: ${message}` }, { status: 502 });
    }
  }
  return NextResponse.json({ detail: "Proxy error: Backend unavailable after retries" }, { status: 503 });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
