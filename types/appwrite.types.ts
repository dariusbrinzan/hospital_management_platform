export interface Patient {
  $id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date | string;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocumentId?: string | null;
  identificationDocumentUrl?: string | null;
  privacyConsent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  $id: string;
  patient: Patient;
  schedule: Date | string;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string | null;
  userId: string;
  cancellationReason: string | null;
  analysisResults?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
