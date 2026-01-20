import { NextRequest, NextResponse } from "next/server";
import { medicationHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const medications = category
      ? medicationHelpers.getByCategory(category)
      : medicationHelpers.getAll();

    return NextResponse.json(medications);
  } catch (error: any) {
    console.error("Error fetching medications:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea medicamentelor" },
      { status: 500 }
    );
  }
}
