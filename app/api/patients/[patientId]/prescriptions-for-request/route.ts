import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { patientHelpers, prescriptionHelpers } from "@/lib/db-helpers";

export async function GET(
  _request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.$id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
    const patient = patientHelpers.getById(params.patientId);
    if (!patient?.$id || patient.userId !== session.$id) {
      return NextResponse.json({ error: "Neautorizat sau pacient negăsit" }, { status: 403 });
    }
    const all = prescriptionHelpers.getAllByPatientId(patient.$id);
    const active = all.filter((p) => p.status === "active");
    return NextResponse.json(active);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
