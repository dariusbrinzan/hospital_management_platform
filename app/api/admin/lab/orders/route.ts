import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { labOrderHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const orders = labOrderHelpers.getAll(status);
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { patientId, medicalRecordId, appointmentId, priority, notes, tests } = body as {
      patientId: string;
      medicalRecordId?: string;
      appointmentId?: string;
      priority?: string;
      notes?: string;
      tests: { testTypeId: string; medicationId?: string }[];
    };
    if (!patientId || !tests?.length) {
      return NextResponse.json({ error: "patientId și tests sunt obligatorii." }, { status: 400 });
    }
    const order = labOrderHelpers.create({
      patientId,
      medicalRecordId,
      appointmentId,
      orderedBy: "Admin",
      priority,
      notes,
      tests: tests.map((t: any) => ({ testTypeId: t.testTypeId, medicationId: t.medicationId })),
    });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
