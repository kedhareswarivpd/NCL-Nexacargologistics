import { NextRequest, NextResponse } from "next/server";

function getBackendBase(): string {
  const defaultUrl = process.env.VERCEL
    ? "https://nexacargo-backend.onrender.com"
    : "http://127.0.0.1:8000";
  let raw = (process.env.BACKEND_API_URL || defaultUrl).trim();
  while (raw.endsWith("/")) {
    raw = raw.slice(0, -1);
  }
  return `${raw}/api/v1`;
}

async function proxyWithRetry(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: string | undefined
): Promise<NextResponse> {
  const idempotent = method === "GET" || method === "HEAD" || method === "OPTIONS";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);
      const res = await fetch(url, { method, headers, body, signal: controller.signal });
      clearTimeout(timeoutId);

      const status = res.status;
      if (idempotent && (status === 502 || status === 503 || status === 504) && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }

      const data = await res.text();
      if (!res.ok) {
        console.error(`[proxy] ${method} ${url} ? HTTP ${status}\nBackend response: ${data.slice(0, 500)}`);
      }

      if (status === 204) {
        return new NextResponse(null, { status: 204 });
      }

      return new NextResponse(data || "{}", {
        status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
      });
    } catch (err) {
      console.error(`[proxy] ${method} ${url} attempt ${attempt} threw:`, err);
      if (idempotent && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }
      const message = err instanceof Error ? err.message : "Backend unreachable";
      return NextResponse.json({ detail: `Proxy error: ${message}` }, { status: 502 });
    }
  }
  return NextResponse.json({ detail: "Proxy error: Backend unavailable after retries" }, { status: 503 });
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

  return proxyWithRetry(url, req.method, headers, body);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return handler(req, ctx); }
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
