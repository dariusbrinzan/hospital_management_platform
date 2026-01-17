import { NextRequest, NextResponse } from "next/server";
import { icuHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const rooms = icuHelpers.getAllRooms();
    return NextResponse.json(rooms);
  } catch (error: any) {
    console.error("Error fetching ICU rooms:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea sălilor ATI" },
      { status: 500 }
    );
  }
}
