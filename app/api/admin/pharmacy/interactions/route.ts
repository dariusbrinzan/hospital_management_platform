import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { medicationInteractionHelpers } from "@/lib/db-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const list = medicationInteractionHelpers.getAll();
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { medicationId1, medicationId2, severity, description } = body as { medicationId1: string; medicationId2: string; severity: string; description?: string };
    if (!medicationId1 || !medicationId2 || !severity) {
      return NextResponse.json({ error: "medicationId1, medicationId2 și severity sunt obligatorii." }, { status: 400 });
    }
    const created = medicationInteractionHelpers.create({ medicationId1, medicationId2, severity, description });
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
