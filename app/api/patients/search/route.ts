import { NextRequest, NextResponse } from "next/server";
import { patientHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const patients = patientHelpers.search(query.trim());
    return NextResponse.json(patients);
  } catch (error: any) {
    console.error("Error searching patients:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la căutarea pacienților" },
      { status: 500 }
    );
  }
}
