import { NextRequest, NextResponse } from "next/server";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { imagingStudyHelpers } from "@/lib/db-helpers";

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
    const updated = imagingStudyHelpers.markReviewed(params.id, doctorName, noteForPatient);
    if (!updated) {
      return NextResponse.json({ error: "Studiu negăsit" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error marking imaging study reviewed:", error);
    return NextResponse.json(
      { error: "Eroare la marcarea studiului" },
      { status: 500 }
    );
  }
}
