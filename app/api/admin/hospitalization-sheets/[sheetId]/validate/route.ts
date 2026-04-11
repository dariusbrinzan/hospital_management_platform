import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { hospitalizationSheetHelpers } from "@/lib/db-helpers";

export async function POST(
  _request: Request,
  { params }: { params: { sheetId: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate valida foile de spitalizare." }, { status: 401 });
    }

    const result = hospitalizationSheetHelpers.validate(params.sheetId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut valida foaia de spitalizare." },
      { status: 400 }
    );
  }
}
