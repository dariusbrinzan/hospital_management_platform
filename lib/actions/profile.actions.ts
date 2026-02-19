"use server";

import { revalidatePath } from "next/cache";
import { patientHelpers, allergyHelpers } from "@/lib/db-helpers";
import { requireAuth } from "@/lib/actions/auth.actions";

export async function updateMedicalProfile(
  patientId: string,
  data: {
    bloodType?: string;
    height?: number | null;
    weight?: number | null;
    allergies?: string;
    currentMedication?: string;
    chronicDiseases?: string;
    cardiovascularDiseases?: string;
    pastMedicalHistory?: string;
    familyMedicalHistory?: string;
    surgeries?: string;
  }
) {
  const session = await requireAuth();
  const patient = patientHelpers.getById(patientId);
  if (!patient || patient.userId !== session.$id) {
    return { success: false, error: "Acces interzis" };
  }

  try {
    patientHelpers.update(patientId, data);
    revalidatePath(`/patients/${session.$id}/profile`);
    revalidatePath(`/patients/${session.$id}/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Eroare la actualizare" };
  }
}

export async function updateLifestyle(
  patientId: string,
  data: {
    smokingStatus?: string;
    alcoholConsumption?: string;
    exerciseFrequency?: string;
  }
) {
  const session = await requireAuth();
  const patient = patientHelpers.getById(patientId);
  if (!patient || patient.userId !== session.$id) {
    return { success: false, error: "Acces interzis" };
  }

  try {
    patientHelpers.update(patientId, data);
    revalidatePath(`/patients/${session.$id}/profile`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Eroare la actualizare" };
  }
}

export async function updateContactInfo(
  patientId: string,
  data: {
    phone?: string;
    email?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactNumber?: string;
  }
) {
  const session = await requireAuth();
  const patient = patientHelpers.getById(patientId);
  if (!patient || patient.userId !== session.$id) {
    return { success: false, error: "Acces interzis" };
  }

  try {
    patientHelpers.update(patientId, data);
    revalidatePath(`/patients/${session.$id}/profile`);
    revalidatePath(`/patients/${session.$id}/dashboard`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Eroare la actualizare" };
  }
}

export async function addAllergy(
  patientId: string,
  data: {
    allergenType: string;
    allergenName: string;
    reactionType: string;
    severity: string;
    symptoms?: string;
    notes?: string;
  }
) {
  const session = await requireAuth();
  const patient = patientHelpers.getById(patientId);
  if (!patient || patient.userId !== session.$id) {
    return { success: false, error: "Acces interzis" };
  }

  try {
    const allergy = allergyHelpers.create({
      patientId,
      allergenType: data.allergenType,
      allergenName: data.allergenName,
      reactionType: data.reactionType,
      severity: data.severity,
      symptoms: data.symptoms,
      notes: data.notes,
      reportedBy: "patient",
      status: "active",
    });
    revalidatePath(`/patients/${session.$id}/profile`);
    return { success: true, allergy };
  } catch (error: any) {
    return { success: false, error: error.message || "Eroare la adăugare" };
  }
}

export async function updateAllergy(
  allergyId: string,
  data: {
    allergenType?: string;
    allergenName?: string;
    severity?: string;
    symptoms?: string;
    status?: string;
    notes?: string;
  }
) {
  const session = await requireAuth();
  const allergy = allergyHelpers.getById(allergyId);
  if (!allergy) return { success: false, error: "Alergia nu a fost găsită" };

  const patient = patientHelpers.getById(allergy.patientId);
  if (!patient || patient.userId !== session.$id) {
    return { success: false, error: "Acces interzis" };
  }

  try {
    allergyHelpers.update(allergyId, data);
    revalidatePath(`/patients/${session.$id}/profile`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Eroare la actualizare" };
  }
}

export async function deleteAllergy(allergyId: string) {
  const session = await requireAuth();
  const allergy = allergyHelpers.getById(allergyId);
  if (!allergy) return { success: false, error: "Alergia nu a fost găsită" };

  const patient = patientHelpers.getById(allergy.patientId);
  if (!patient || patient.userId !== session.$id) {
    return { success: false, error: "Acces interzis" };
  }

  try {
    allergyHelpers.delete(allergyId);
    revalidatePath(`/patients/${session.$id}/profile`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Eroare la ștergere" };
  }
}
