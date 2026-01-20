import { NextRequest, NextResponse } from "next/server";
import { medicalDocumentHelpers } from "@/lib/db-helpers";
import { readFile } from "fs/promises";
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
      "download",
      ip,
      userAgent
    );

    // Citire fișier
    const filePath = join(process.cwd(), "public", document.filePath);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Fișierul nu a fost găsit pe server" },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);

    // Returnare fișier cu headers corespunzători
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.originalFileName}"`,
        "Content-Length": document.fileSize.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error downloading document:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la descărcarea documentului" },
      { status: 500 }
    );
  }
}
