import { NextRequest, NextResponse } from "next/server";

function getBackendBase(): string {
  let raw = (process.env.BACKEND_API_URL || "http://127.0.0.1:8000/api/v1").trim().replace(/\/+$/, "");
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

  try {
    const res = await fetch(url, { method: req.method, headers, body });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Backend unreachable";
    return NextResponse.json({ detail: `Proxy error: ${message}` }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
