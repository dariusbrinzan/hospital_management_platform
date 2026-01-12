"use server";

import { patientHelpers, userHelpers } from "../db-helpers";
import { parseStringify } from "../utils";

// CREATE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    // Verifică dacă utilizatorul există deja
    const existingUser = userHelpers.getByEmail(user.email);
    if (existingUser) {
      const parsed = parseStringify(existingUser);
      return parsed;
    }

    // Creează utilizator nou
    const newUser = await userHelpers.create(user);
    const parsed = parseStringify(newUser);
    
    if (!parsed || !parsed.$id) {
      throw new Error("Failed to create user - missing ID");
    }
    
    return parsed;
  } catch (error: any) {
    console.error("An error occurred while creating a new user:", error);
    throw error;
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = userHelpers.getById(userId);
    return user ? parseStringify(user) : null;
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error
    );
    return null;
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    // Gestionează upload-ul de fișier
    let fileId = null;
    let fileUrl = null;

    if (identificationDocument) {
      const blobFile = identificationDocument.get("blobFile") as Blob;
      const fileName = identificationDocument.get("fileName") as string;

      if (blobFile && fileName) {
        const { writeFile, mkdir } = await import("fs/promises");
        const { join } = await import("path");
        const { randomUUID } = await import("crypto");

        const bytes = await blobFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        fileId = randomUUID();
        const uploadsDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        const filePath = join(uploadsDir, `${fileId}-${fileName}`);
        await writeFile(filePath, buffer);

        fileUrl = `/uploads/${fileId}-${fileName}`;
      }
    }

    const patientData = {
      ...patient,
      identificationDocumentId: fileId,
      identificationDocumentUrl: fileUrl,
    };

    const newPatient = patientHelpers.create(patientData);
    return parseStringify(newPatient);
  } catch (error) {
    console.error("An error occurred while creating a new patient:", error);
    throw error;
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patient = patientHelpers.getByUserId(userId);
    return patient ? parseStringify(patient) : null;
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
    return null;
  }
};

// GET PATIENT BY ID
export const getPatientById = async (patientId: string) => {
  try {
    const patient = patientHelpers.getById(patientId);
    return patient ? parseStringify(patient) : null;
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
    return null;
  }
};
