/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type Gender = "Bărbat" | "Femeie";
declare type Status = "pending" | "scheduled" | "cancelled";

declare interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}
declare interface User extends CreateUserParams {
  $id: string;
}

declare interface RegisterUserParams extends CreateUserParams {
  userId: string;
  birthDate: Date;
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
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}

declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  timeZone: string;
  appointment: Appointment;
  type: string;
};

declare interface DoctorEducation {
  degree: string;
  institution: string;
  country: "România" | "Străinătate";
  year: number;
}

declare interface Doctor {
  image: string;
  name: string;
  specialty: string;
  age?: number;
  education?: DoctorEducation[];
  experience?: number; // în ani
  additionalSpecializations?: string[];
  languages?: string[];
  certifications?: string[];
}

declare type EmergencyState = "arrival" | "triage" | "consent" | "admission" | "treatment" | "discharge";
declare type TriageLevel = "critic" | "urgent" | "normal";

declare interface EmergencyCase {
  $id: string;
  patientId: string;
  triageLevel: TriageLevel;
  currentState: EmergencyState;
  assignedDoctorId?: string | null;
  arrivalTime: Date | string;
  triageTime?: Date | string | null;
  admissionTime?: Date | string | null;
  dischargeTime?: Date | string | null;
  priority: number; // 1-5, unde 1 = cel mai critic
  chiefComplaint: string;
  vitalSigns?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  } | null;
  consentGiven: boolean;
  carePlan?: string | null;
  dischargeLetter?: string | null;
  skipReason?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  patient?: Patient;
}

declare interface DoctorOnDuty {
  $id: string;
  doctorName: string;
  weekStartDate: Date | string;
  weekEndDate: Date | string;
  specialty?: string | null;
  isAvailable: boolean;
  maxConcurrentEmergencies: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface EmergencyStateTransition {
  $id: string;
  emergencyCaseId: string;
  fromState: EmergencyState;
  toState: EmergencyState;
  transitionReason?: string | null;
  performedBy: string;
  timestamp: Date | string;
  metadata?: any;
}

declare interface EmergencyDocument {
  $id: string;
  emergencyCaseId: string;
  documentType: "consent" | "care_plan" | "discharge_letter" | "evaluation";
  content: string;
  signedBy?: string | null;
  signedAt?: Date | string | null;
  createdAt: Date | string;
}
