import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { labTestTypeHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const category = request.nextUrl.searchParams.get("category") ?? undefined;
    const list = labTestTypeHelpers.getAll(category);
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}
