import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { medicationRequestHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const requests = medicationRequestHelpers.getAll(status);
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}
