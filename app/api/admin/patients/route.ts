import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { patientHelpers } from "@/lib/db-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const patients = patientHelpers.getAll();
    return NextResponse.json(
      patients.map((p) => ({ $id: p.$id, name: p.name, email: p.email ?? "" }))
    );
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}
