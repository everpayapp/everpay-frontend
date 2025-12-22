import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://bibliomaniacal-aubrielle-advisedly.ngrok-free.dev/logs");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Unable to fetch payments" }, { status: 500 });
  }
}
