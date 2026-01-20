import { NextRequest, NextResponse } from "next/server";
import { icuHelpers, medicationStockHelpers, medicationTransactionHelpers } from "@/lib/db-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const treatments = icuHelpers.getTreatmentsByPatientId(params.patientId);
    return NextResponse.json(treatments);
  } catch (error: any) {
    console.error("Error fetching treatments:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea tratamentelor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const body = await request.json();
    const {
      medicationStockId,
      medicationName,
      dosage,
      quantity,
      frequency,
      route,
      administeredBy,
      notes,
    } = body;

    if (!medicationName || !dosage || !frequency) {
      return NextResponse.json(
        { error: "medicationName, dosage, și frequency sunt obligatorii" },
        { status: 400 }
      );
    }

    // Dacă există medicationStockId și quantity, scade din stoc
    if (medicationStockId && quantity) {
      const stock = medicationStockHelpers.getById(medicationStockId);
      if (!stock) {
        return NextResponse.json(
          { error: "Stocul medicamentului nu a fost găsit" },
          { status: 404 }
        );
      }

      if (stock.availableQuantity < quantity) {
        return NextResponse.json(
          { error: `Stoc insuficient. Disponibil: ${stock.availableQuantity} ${stock.medication?.unit || ""}, Cerut: ${quantity}` },
          { status: 400 }
        );
      }

      // Consumă din stoc
      medicationStockHelpers.consumeQuantity(medicationStockId, quantity);

      // Creează tranzacție
      medicationTransactionHelpers.create({
        medicationId: stock.medicationId,
        stockId: medicationStockId,
        transactionType: "usage",
        quantity: -quantity,
        reason: `Tratament ATI - ${medicationName}`,
        performedBy: administeredBy || "System",
        relatedTo: "icu_treatment",
        relatedId: params.patientId,
        notes: notes || undefined,
      });
    }

    const treatment = icuHelpers.addTreatment({
      icuPatientId: params.patientId,
      medicationName,
      dosage,
      frequency,
      route,
      administeredBy,
      notes,
    });

    return NextResponse.json(treatment);
  } catch (error: any) {
    console.error("Error adding treatment:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la adăugarea tratamentului" },
      { status: 500 }
    );
  }
}
