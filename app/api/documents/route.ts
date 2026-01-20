import { NextRequest, NextResponse } from "next/server";
import { medicalDocumentHelpers } from "@/lib/db-helpers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const appointmentId = searchParams.get("appointmentId");
    const documentType = searchParams.get("documentType");
    const category = searchParams.get("category");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId este obligatoriu" },
        { status: 400 }
      );
    }

    const documents = medicalDocumentHelpers.getByPatientId(patientId, {
      documentType: documentType || undefined,
      category: category || undefined,
      appointmentId: appointmentId || undefined,
    });

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la preluarea documentelor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const patientId = formData.get("patientId") as string;
    const appointmentId = formData.get("appointmentId") as string | null;
    const documentType = formData.get("documentType") as string;
    const category = formData.get("category") as string | null;
    const description = formData.get("description") as string | null;
    const tags = formData.get("tags") as string | null;
    const uploadedBy = formData.get("uploadedBy") as string || "System";

    if (!file || !patientId || !documentType) {
      return NextResponse.json(
        { error: "file, patientId și documentType sunt obligatorii" },
        { status: 400 }
      );
    }

    // Validare tip fișier
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tip de fișier nepermis. Permise: PDF, imagini, Word" },
        { status: 400 }
      );
    }

    // Validare dimensiune (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fișierul este prea mare. Maxim 10MB" },
        { status: 400 }
      );
    }

    // Salvare fișier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileExtension = file.name.split(".").pop() || "";
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "documents", patientId);
    
    // Creează directorul dacă nu există
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    // Salvare în baza de date
    const relativePath = `/uploads/documents/${patientId}/${uniqueFileName}`;
    const tagsArray = tags ? tags.split(",").map((t) => t.trim()) : undefined;

    const document = medicalDocumentHelpers.create({
      patientId,
      appointmentId: appointmentId || undefined,
      documentType,
      category: category || undefined,
      fileName: uniqueFileName,
      originalFileName: file.name,
      filePath: relativePath,
      fileSize: file.size,
      mimeType: file.type,
      description: description || undefined,
      tags: tagsArray,
      uploadedBy,
    });

    // Log acces
    medicalDocumentHelpers.logAccess(document.$id, uploadedBy, "view");

    return NextResponse.json(document);
  } catch (error: any) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la upload document" },
      { status: 500 }
    );
  }
}
