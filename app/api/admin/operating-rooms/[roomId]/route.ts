import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { operatingRoomHelpers } from "@/lib/db-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate actualiza sala." }, { status: 401 });
    }

    const body = await request.json();
    if (!body.status) {
      return NextResponse.json({ error: "Statusul sălii este obligatoriu." }, { status: 400 });
    }

    const updated = operatingRoomHelpers.updateStatus(params.roomId, body.status);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut actualiza statusul sălii." },
      { status: 400 }
    );
  }
}
