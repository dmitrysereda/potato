import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.redirect(new URL("/clients", request.url));
  }

  return NextResponse.redirect(
    new URL(`/clients/${clientId}/profiles`, request.url)
  );
}
