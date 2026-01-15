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

// Istoric Medical
declare type MedicalRecordType = "consultation" | "diagnosis" | "procedure" | "lab_result" | "imaging" | "vaccination";

declare interface MedicalRecord {
  $id: string;
  patientId: string;
  appointmentId?: string | null;
  doctorName: string;
  recordType: MedicalRecordType;
  visitDate: Date | string;
  chiefComplaint?: string | null;
  subjectiveNotes?: string | null;
  objectiveFindings?: string | null;
  assessment?: string | null;
  plan?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  diagnoses?: Diagnosis[];
  prescriptions?: Prescription[];
  vitalSigns?: VitalSigns;
  labResults?: LabResult[];
  procedures?: Procedure[];
}

declare interface Diagnosis {
  $id: string;
  medicalRecordId: string;
  diagnosisCode?: string | null;
  diagnosisName: string;
  diagnosisType: "primary" | "secondary" | "differential" | "rule_out";
  status: "active" | "resolved" | "chronic" | "history";
  onsetDate?: Date | string | null;
  resolvedDate?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
}

declare interface Prescription {
  $id: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string | null;
  quantity?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  instructions?: string | null;
  refills: number;
  status: "active" | "completed" | "discontinued";
  discontinuedReason?: string | null;
  createdAt: Date | string;
}

declare interface VitalSigns {
  $id: string;
  medicalRecordId: string;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  pulse?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
  respiratoryRate?: number | null;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  glucoseLevel?: number | null;
  notes?: string | null;
  recordedAt: Date | string;
}

declare interface LabResult {
  $id: string;
  medicalRecordId: string;
  appointmentId?: string | null;
  testName: string;
  testCategory?: string | null;
  resultValue?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  status: "normal" | "abnormal" | "critical";
  notes?: string | null;
  performedDate: Date | string;
  createdAt: Date | string;
}

declare interface Procedure {
  $id: string;
  medicalRecordId: string;
  procedureName: string;
  procedureCode?: string | null;
  procedureDate: Date | string;
  performedBy: string;
  location?: string | null;
  anesthesiaType?: string | null;
  complications?: string | null;
  outcome?: string | null;
  followUpRequired: boolean;
  followUpDate?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
}

declare interface AllergyAdverseReaction {
  $id: string;
  patientId: string;
  allergenType: "medication" | "food" | "environmental" | "other";
  allergenName: string;
  reactionType: "allergy" | "intolerance" | "adverse_reaction";
  severity: "mild" | "moderate" | "severe" | "life_threatening";
  symptoms?: string | null;
  firstOccurrenceDate?: Date | string | null;
  lastOccurrenceDate?: Date | string | null;
  status: "active" | "resolved" | "history";
  notes?: string | null;
  reportedBy?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface Vaccination {
  $id: string;
  patientId: string;
  vaccineName: string;
  vaccineType?: string | null;
  administrationDate: Date | string;
  administeredBy?: string | null;
  lotNumber?: string | null;
  manufacturer?: string | null;
  site?: string | null;
  nextDoseDate?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
}

declare interface FamilyHistory {
  $id: string;
  patientId: string;
  relation: string;
  condition: string;
  ageOfOnset?: number | null;
  status?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
