import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/actions/auth.actions";
import { financialTransactionHelpers } from "@/lib/db-helpers";

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Doar administratorul poate înregistra operațiuni financiare." }, { status: 401 });
    }

    const body = await request.json();
    const transaction = financialTransactionHelpers.create({
      transactionType: body.transactionType,
      category: body.category,
      costCenter: body.costCenter,
      amount: Number(body.amount),
      taxAmount: Number(body.taxAmount) || 0,
      deductibleAmount: Number(body.deductibleAmount) || 0,
      status: body.status || "pending",
      description: body.description,
      occurredAt: body.occurredAt,
      createdBy: body.createdBy,
      notes: body.notes,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Nu am putut salva operațiunea financiară." },
      { status: 400 }
    );
  }
}
