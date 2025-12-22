import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const url = `${BACKEND_URL}/${params.path.join("")}${req.nextUrl.search}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const body = await req.json();
    const url = `${BACKEND_URL}/${params.path.join("")}${req.nextUrl.search}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
