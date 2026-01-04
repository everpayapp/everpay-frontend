import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// Next.js 16 expects `params` to be async in some builds/types
type Ctx = { params: Promise<{ path: string[] }> };

function buildBackendUrl(req: NextRequest, pathParts: string[]) {
  const base = (BACKEND_URL || "").replace(/\/$/, "");
  const path = pathParts.join("/");

  // Our frontend route is /api/[...path] so we forward to backend /api/<path>
  return `${base}/api/${path}${req.nextUrl.search}`;
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  // If backend sends HTML (like Cannot GET ...), return it as text so we can see the real error
  const text = await res.text();
  return { error: "Backend did not return JSON", status: res.status, body: text };
}

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const { path } = await params;
    const url = buildBackendUrl(req, path);

    const res = await fetch(url, { method: "GET" });
    const data = await parseResponse(res);

    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { path } = await params;
    const url = buildBackendUrl(req, path);

    const body = await req.json();

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await parseResponse(res);

    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
