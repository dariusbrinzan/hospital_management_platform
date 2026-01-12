import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { dutyId: string } }
) {
  try {
    const { dutyId } = params;
    const body = await request.json();
    const { isAvailable } = body;

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE doctors_on_duty 
      SET isAvailable = ?, updatedAt = ?
      WHERE id = ?
    `).run(isAvailable ? 1 : 0, now, dutyId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating doctor on duty:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea medicului de gardă" },
      { status: 500 }
    );
  }
}
