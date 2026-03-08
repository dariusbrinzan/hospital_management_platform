import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { patientHelpers } from "@/lib/db-helpers";
import { medicationRequestHelpers, prescriptionHelpers } from "@/lib/db-helpers";
import db from "@/lib/db";

export async function GET(
  _request: NextRequest,
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
    const requests = medicationRequestHelpers.getByPatientId(patient.$id);
    return NextResponse.json(requests);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
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
    const body = await request.json();
    const { prescriptionId } = body as { prescriptionId: string };
    if (!prescriptionId) {
      return NextResponse.json({ error: "prescriptionId este obligatoriu." }, { status: 400 });
    }
    const prescription = prescriptionHelpers.getById(prescriptionId);
    if (!prescription) {
      return NextResponse.json({ error: "Rețeta nu a fost găsită." }, { status: 404 });
    }
    const record = db.prepare("SELECT patientId FROM medical_records WHERE id = ?").get(prescription.medicalRecordId) as { patientId: string } | undefined;
    if (!record || record.patientId !== patient.$id) {
      return NextResponse.json({ error: "Rețeta nu vă aparține." }, { status: 403 });
    }
    if (prescription.status !== "active") {
      return NextResponse.json({ error: "Poți solicita doar medicamente din rețete active." }, { status: 400 });
    }
    const existing = db.prepare("SELECT id FROM medication_requests WHERE prescriptionId = ? AND status IN ('pending', 'approved')").get(prescriptionId) as { id: string } | undefined;
    if (existing) {
      return NextResponse.json({ error: "Există deja o cerere activă pentru acest medicament." }, { status: 400 });
    }
    const created = medicationRequestHelpers.create(patient.$id, prescriptionId);
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Eroare" }, { status: 500 });
  }
}
