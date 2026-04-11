import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { ambulanceFuelLogHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate înregistra alimentări." }, { status: 401 });
    }

    const body = await request.json();
    const log = ambulanceFuelLogHelpers.create({
      ambulanceId: body.ambulanceId,
      liters: Number(body.liters),
      costPerLiter: Number(body.costPerLiter),
      totalCost: body.totalCost ? Number(body.totalCost) : undefined,
      odometerKm: body.odometerKm ? Number(body.odometerKm) : undefined,
      fueledAt: body.fueledAt,
      stationName: body.stationName,
      fueledBy: body.fueledBy,
      notes: body.notes,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut salva alimentarea ambulanței." },
      { status: 400 }
    );
  }
}
