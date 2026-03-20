import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!clientId) {
    return NextResponse.redirect(new URL("/clients", appUrl));
  }

  return NextResponse.redirect(
    new URL(`/clients/${clientId}/profiles`, appUrl)
  );
}
