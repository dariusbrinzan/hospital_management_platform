import { NextRequest, NextResponse } from "next/server";
import { medicationStockHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const available = searchParams.get("available") === "true";
    const lowStock = searchParams.get("lowStock") === "true";

    let stocks;
    if (lowStock) {
      stocks = medicationStockHelpers.getLowStock(location || undefined);
    } else if (available && location) {
      stocks = medicationStockHelpers.getAvailableForLocation(location);
    } else {
      stocks = medicationStockHelpers.getAll(location || undefined);
    }

    return NextResponse.json(stocks);
  } catch (error: any) {
    console.error("Error fetching medication stock:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea stocurilor" },
      { status: 500 }
    );
  }
}
