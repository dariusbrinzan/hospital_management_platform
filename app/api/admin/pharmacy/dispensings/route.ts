import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/actions/auth.actions";
import { pharmacyDispensingHelpers } from "@/lib/db-helpers";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const patientId = request.nextUrl.searchParams.get("patientId") ?? undefined;
    let list: any[] = [];
    if (patientId) {
      list = pharmacyDispensingHelpers.getByPatientId(patientId, 100);
    } else {
      const all = db.prepare(`
        SELECT d.id, d.prescriptionId, d.patientId, d.medicationId, d.quantity, d.dispensedAt, d.dispensedBy,
               m.name as medicationName, p.name as patientName
        FROM pharmacy_dispensings d
        LEFT JOIN medications m ON d.medicationId = m.id
        LEFT JOIN patients p ON d.patientId = p.id
        ORDER BY d.dispensedAt DESC LIMIT 200
      `).all() as any[];
      list = all.map((r) => ({ $id: r.id, prescriptionId: r.prescriptionId, patientId: r.patientId, patientName: r.patientName, medicationId: r.medicationId, medicationName: r.medicationName, quantity: r.quantity, dispensedAt: r.dispensedAt, dispensedBy: r.dispensedBy }));
    }
    return NextResponse.json(list);
  } catch {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
}
