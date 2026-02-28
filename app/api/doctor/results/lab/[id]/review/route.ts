import { NextRequest, NextResponse } from "next/server";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { labResultHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorName = await getDoctorSession();
    if (!doctorName) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const noteForPatient = (body.noteForPatient as string) || null;
    const updated = labResultHelpers.markReviewed(params.id, doctorName, noteForPatient);
    if (!updated) {
      return NextResponse.json({ error: "Rezultat negăsit" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error marking lab result reviewed:", error);
    return NextResponse.json(
      { error: "Eroare la marcarea rezultatului" },
      { status: 500 }
    );
  }
}
