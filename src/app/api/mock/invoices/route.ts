import { NextResponse } from "next/server";
import { localDataProvider } from "@/lib/dataProvider";

export async function GET() {
  const data = await localDataProvider.getInvoices();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json({ success: true, data: payload });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  return NextResponse.json({ success: true, data: payload });
}
