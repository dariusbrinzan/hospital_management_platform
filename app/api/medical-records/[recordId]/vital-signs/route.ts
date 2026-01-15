import { NextRequest, NextResponse } from "next/server";
import { vitalSignsHelpers } from "@/lib/db-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const body = await request.json();
    const vitalSigns = vitalSignsHelpers.create({
      medicalRecordId: params.recordId,
      ...body,
    });

    return NextResponse.json(vitalSigns);
  } catch (error: any) {
    console.error("Error creating vital signs:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la crearea semnelor vitale" },
      { status: 500 }
    );
  }
}
