import { NextRequest, NextResponse } from "next/server";
import { medicalDocumentHelpers } from "@/lib/db-helpers";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const document = medicalDocumentHelpers.getById(params.documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: "Documentul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Log acces
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    medicalDocumentHelpers.logAccess(
      params.documentId,
      "System", // TODO: Obține utilizatorul curent
      "view",
      ip,
      userAgent
    );

    return NextResponse.json(document);
  } catch (error: any) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea documentului" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const body = await request.json();
    const { description, tags, category } = body;

    const document = medicalDocumentHelpers.getById(params.documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Documentul nu a fost găsit" },
        { status: 404 }
      );
    }

    const updated = medicalDocumentHelpers.update(params.documentId, {
      description,
      tags,
      category,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la actualizarea documentului" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const body = await request.json();
    const deletedBy = body.deletedBy || "System";

    const document = medicalDocumentHelpers.getById(params.documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Documentul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Ștergere logică
    medicalDocumentHelpers.delete(params.documentId, deletedBy);

    // Opțional: ștergere fizică a fișierului (comentat pentru siguranță)
    // const filePath = join(process.cwd(), "public", document.filePath);
    // if (existsSync(filePath)) {
    //   await unlink(filePath);
    // }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la ștergerea documentului" },
      { status: 500 }
    );
  }
}
