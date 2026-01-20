import { NextRequest, NextResponse } from "next/server";
import { ambulanceHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get("available") === "true";

    const ambulances = availableOnly
      ? ambulanceHelpers.getAvailable()
      : ambulanceHelpers.getAll();

    return NextResponse.json(ambulances);
  } catch (error: any) {
    console.error("Error fetching ambulances:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea ambulanțelor" },
      { status: 500 }
    );
  }
}
