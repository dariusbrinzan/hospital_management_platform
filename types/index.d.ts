/* eslint-disable no-unused-vars, no-use-before-define */

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
  appointmentType?: "in_person" | "video";
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

declare type EmergencyState = "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge";
declare type TriageLevel = "critic" | "urgent" | "normal";

declare interface EmergencyCase {
  $id: string;
  patientId?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  patientAge?: string | null;
  patientGender?: string | null;
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
  patient?: Patient | null;
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

// Sistem Dispecerat Ambulanțe
declare type AmbulanceStatus = "available" | "on_mission" | "at_hospital" | "maintenance" | "out_of_service";
declare type MissionStatus = "dispatched" | "en_route" | "at_scene" | "transporting" | "at_hospital" | "completed" | "cancelled";
declare type MissionType = "emergency" | "transfer" | "standby";

declare interface Ambulance {
  $id: string;
  ambulanceNumber: string;
  licensePlate: string;
  status: AmbulanceStatus;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  crew: {
    driver: string;
    medic?: string;
    assistant?: string;
  };
  equipment: {
    defibrillator?: boolean;
    oxygen?: boolean;
    stretcher?: boolean;
    firstAidKit?: boolean;
    monitor?: boolean;
    ventilator?: boolean;
    [key: string]: any;
  };
  lastMaintenanceDate?: Date | string | null;
  nextMaintenanceDate?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface AmbulanceMission {
  $id: string;
  ambulanceId: string;
  emergencyCaseId?: string | null;
  missionType: MissionType;
  priority: number; // 1-10, 1 = cel mai critic
  callerName?: string | null;
  callerPhone: string;
  pickupLocation: {
    address: string;
    lat?: number;
    lng?: number;
  };
  destinationLocation?: {
    address: string;
    lat?: number;
    lng?: number;
  } | null;
  patientName?: string | null;
  patientAge?: string | null;
  patientGender?: string | null;
  chiefComplaint: string;
  estimatedArrivalTime?: Date | string | null;
  estimatedReturnTime?: Date | string | null;
  status: MissionStatus;
  dispatchedAt: Date | string;
  enRouteAt?: Date | string | null;
  atSceneAt?: Date | string | null;
  transportingAt?: Date | string | null;
  atHospitalAt?: Date | string | null;
  completedAt?: Date | string | null;
  cancelledAt?: Date | string | null;
  cancelledReason?: string | null;
  dispatcherName: string;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  ambulance?: Ambulance | null;
  emergencyCase?: EmergencyCase | null;
}

// Management Stocuri Medicamente
declare type MedicationCategory = "medication" | "infusion" | "syringe" | "supply";
declare type MedicationLocation = "main_pharmacy" | "emergency_department" | "icu_ward" | "surgery_ward";
declare type TransactionType = "restock" | "usage" | "adjustment" | "expired" | "damaged" | "return";
declare type MedicationAdministrationPhase = "before_doctor" | "doctor_care";

declare interface Medication {
  $id: string;
  name: string;
  genericName?: string | null;
  category: MedicationCategory;
  unit: string;
  dosageForm?: string | null;
  strength?: string | null;
  manufacturer?: string | null;
  batchNumber?: string | null;
  expirationDate?: Date | string | null;
  storageConditions?: string | null;
  description?: string | null;
  indications?: string[] | null;
  contraindications?: string[] | null;
  sideEffects?: string[] | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface MedicationStock {
  $id: string;
  medicationId: string;
  location: MedicationLocation;
  quantity: number;
  reservedQuantity: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderQuantity?: number | null;
  lastRestockedDate?: Date | string | null;
  lastRestockedQuantity?: number | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  medication?: Medication | null;
  availableQuantity?: number; // quantity - reservedQuantity
}

declare interface MedicationTransaction {
  $id: string;
  medicationId: string;
  stockId: string;
  transactionType: TransactionType;
  quantity: number; // Pozitiv pentru restock, negativ pentru usage
  reason?: string | null;
  performedBy: string;
  relatedTo?: string | null; // 'icu_treatment', 'emergency_case', 'appointment', etc.
  relatedId?: string | null;
  notes?: string | null;
  transactionDate: Date | string;
  createdAt: Date | string;
  medication?: Medication | null;
  stock?: MedicationStock | null;
}

declare interface PatientMedicationAdministration {
  $id: string;
  patientId: string;
  emergencyCaseId?: string | null;
  medicationId?: string | null;
  stockId?: string | null;
  medicationName: string;
  dosage: string;
  quantity: number;
  unit?: string | null;
  route?: string | null;
  administrationPhase: MedicationAdministrationPhase;
  administeredBy?: string | null;
  administeredAt: Date | string;
  notes?: string | null;
  stockLocation?: MedicationLocation | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  medication?: Partial<Medication> | null;
}

// Sistem Documente Medicale
declare type MedicalDocumentType = "analysis" | "image" | "report" | "consent" | "certificate" | "other";
declare type MedicalDocumentCategory = "external_analysis" | "radiology" | "laboratory" | "consultation" | "administrative" | "legal" | "other";

declare interface MedicalDocument {
  $id: string;
  patientId: string;
  appointmentId?: string | null;
  documentType: MedicalDocumentType;
  category?: MedicalDocumentCategory | null;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string | null;
  tags?: string[] | null;
  uploadedBy: string;
  uploadedAt: Date | string;
  isApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: Date | string | null;
  version: number;
  parentDocumentId?: string | null;
  isDeleted: boolean;
  deletedAt?: Date | string | null;
  deletedBy?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  patient?: Patient | null;
  appointment?: Appointment | null;
  downloadUrl?: string; // Generat dinamic pentru securitate
}

declare interface DoctorReview {
  $id: string;
  appointmentId: string;
  patientId: string;
  doctorName: string;
  rating: number;
  comment?: string | null;
  createdAt: Date | string;
}

declare interface DocumentAccessLog {
  $id: string;
  documentId: string;
  accessedBy: string;
  accessType: "view" | "download" | "delete" | "approve";
  accessedAt: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// ICU Types
declare interface ICURoom {
  $id: string;
  roomNumber: number;
  maxCapacity: number;
  currentOccupancy: number;
  isAvailable: boolean;
  equipment?: any;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface ICUPatient {
  $id: string;
  emergencyCaseId?: string | null;
  patientId?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  patientAge?: string | null;
  patientGender?: string | null;
  roomId: string;
  bedNumber: number;
  admissionDate: Date | string;
  dischargeDate?: Date | string | null;
  status: "critical" | "stable" | "improving" | "deteriorating";
  assignedDoctorId?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  room?: {
    $id: string;
    roomNumber: number;
  };
}

// Hospital Room & Admission Types (Spitalizări Normale)
declare interface HospitalRoom {
  $id: string;
  roomNumber: string;
  floor: number;
  department: string;
  roomType: "standard" | "private" | "semi_private" | "isolation";
  maxCapacity: number;
  currentOccupancy: number;
  isAvailable: boolean;
  roomStatus?: "available" | "cleaning" | "disinfection";
  equipment?: any;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface HospitalAdmission {
  $id: string;
  patientId?: string | null;
  appointmentId?: string | null;
  patientName: string;
  patientPhone?: string | null;
  patientAge?: string | null;
  patientGender?: string | null;
  roomId: string;
  bedNumber: number;
  admissionDate: Date | string;
  dischargeDate?: Date | string | null;
  admissionType: "elective" | "urgent" | "emergency" | "transfer";
  admissionReason: string;
  diagnosis?: string | null;
  admittingDoctor: string;
  assignedDoctor?: string | null;
  department: string;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  expectedLengthOfStay?: number | null;
  status: "admitted" | "stable" | "improving" | "ready_for_discharge" | "discharged";
  dischargeInstructions?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  room?: {
    $id: string;
    roomNumber: string;
    floor: number;
    department: string;
  };
}

declare type HospitalizationSheetType = "continuous" | "day";
declare type HospitalizationValidationStatus = "draft" | "valid" | "invalid";
declare type HospitalizationReportStatus = "draft" | "batched" | "submitted" | "accepted" | "rejected";
declare type HospitalizationBatchStatus = "draft" | "validated" | "submitted" | "accepted" | "partially_rejected" | "rejected";
declare type HospitalizationDiagnosisKind = "admission" | "principal" | "secondary";
declare type HospitalizationProcedureKind = "diagnostic" | "therapeutic" | "surgical" | "administrative";

declare interface HospitalizationSheet {
  $id: string;
  patientId: string;
  admissionId?: string | null;
  appointmentId?: string | null;
  sheetNumber: string;
  sheetYear: number;
  hospitalizationType: HospitalizationSheetType;
  admissionType: string;
  insuranceStatus: string;
  cnasPayerType: string;
  admissionDate: Date | string;
  dischargeDate: Date | string;
  admissionSection: string;
  dischargeSection: string;
  attendingPhysician: string;
  admissionDiagnosis: string;
  mainDiagnosis: string;
  dischargeStatus: string;
  dischargeType: string;
  totalDays: number;
  expectedReimbursement: number;
  validationStatus: HospitalizationValidationStatus;
  reportStatus: HospitalizationReportStatus;
  validationErrors: string[];
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  patient?: {
    $id: string;
    name: string;
    insuranceProvider?: string | null;
    insurancePolicyNumber?: string | null;
  } | null;
}

declare interface HospitalizationSheetDiagnosis {
  $id: string;
  sheetId: string;
  diagnosisCode?: string | null;
  diagnosisName: string;
  diagnosisKind: HospitalizationDiagnosisKind;
  presentOnAdmission: boolean;
  createdAt: Date | string;
}

declare interface HospitalizationSheetProcedure {
  $id: string;
  sheetId: string;
  procedureCode?: string | null;
  procedureName: string;
  procedureKind: HospitalizationProcedureKind;
  performedAt?: Date | string | null;
  performer?: string | null;
  createdAt: Date | string;
}

declare interface HospitalizationReportingBatch {
  $id: string;
  batchMonth: number;
  batchYear: number;
  status: HospitalizationBatchStatus;
  totalSheets: number;
  acceptedSheets: number;
  rejectedSheets: number;
  exportPayload?: string | null;
  responseSummary?: string | null;
  createdAt: Date | string;
  validatedAt?: Date | string | null;
  submittedAt?: Date | string | null;
  updatedAt: Date | string;
}

declare interface HospitalizationReportingBatchItem {
  $id: string;
  batchId: string;
  sheetId: string;
  itemStatus: HospitalizationReportStatus;
  responseMessage?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  sheet?: HospitalizationSheet | null;
}

// Bloc operator / intervenții chirurgicale
declare type OperatingRoomStatus = "available" | "reserved" | "in_use" | "cleaning" | "maintenance";
declare type SurgeryUrgency = "elective" | "priority" | "emergency";
declare type SurgeryCaseStatus =
  | "proposed"
  | "anesthesia_pending"
  | "ready_to_schedule"
  | "scheduled"
  | "completed"
  | "cancelled";
declare type AnesthesiaClearanceStatus = "pending" | "cleared" | "conditional" | "denied";
declare type SurgeryBookingStatus = "planned" | "confirmed" | "in_progress" | "completed" | "cancelled";
declare type SurgeryCoverageType = "cass_full" | "cass_partial" | "private_full" | "mixed";
declare type SurgeryPaymentStatus = "pending" | "partially_paid" | "paid" | "exempt";

declare interface OperatingRoom {
  $id: string;
  roomNumber: string;
  specialty: string;
  floor: number;
  status: OperatingRoomStatus;
  hasAnesthesiaMachine: boolean;
  hasImagingSupport: boolean;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface SurgeryCase {
  $id: string;
  patientId: string;
  appointmentId?: string | null;
  requestedByDoctor: string;
  surgicalSpecialty: string;
  procedureName: string;
  diagnosis: string;
  urgency: SurgeryUrgency;
  estimatedDurationMinutes: number;
  preferredDate?: Date | string | null;
  requiresICUBed: boolean;
  implantNeeded: boolean;
  status: SurgeryCaseStatus;
  clinicalNotes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  patient?: {
    $id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
}

declare interface AnesthesiaConsultation {
  $id: string;
  surgeryCaseId: string;
  anesthesiologistName: string;
  consultDate: Date | string;
  asaRisk: string;
  airwayAssessment?: string | null;
  fastingConfirmed: boolean;
  recommendations?: string | null;
  clearanceStatus: AnesthesiaClearanceStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare interface SurgeryBooking {
  $id: string;
  surgeryCaseId: string;
  roomId: string;
  scheduledStart: Date | string;
  scheduledEnd: Date | string;
  surgeonName: string;
  anesthesiologistName?: string | null;
  nursingTeam?: string | null;
  supportTeam?: string | null;
  bookingStatus: SurgeryBookingStatus;
  preOpChecklist?: string | null;
  postopDestination?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  room?: {
    $id: string;
    roomNumber: string;
    specialty: string;
  } | null;
}

declare interface SurgeryFinancialCase {
  $id: string;
  surgeryCaseId: string;
  coverageType: SurgeryCoverageType;
  estimatedTotal: number;
  cassCoveredAmount: number;
  patientAmount: number;
  paymentStatus: SurgeryPaymentStatus;
  billingNotes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

declare type FinancialTransactionType = "revenue" | "expense" | "deduction" | "reimbursement";
declare type FinancialCategory =
  | "surgery"
  | "hospitalization"
  | "imaging"
  | "laboratory"
  | "pharmacy"
  | "medication_procurement"
  | "ambulance_fuel"
  | "ambulance_maintenance"
  | "consumables"
  | "equipment_maintenance"
  | "utilities"
  | "salary"
  | "insurance"
  | "it_infrastructure"
  | "other";
declare type FinancialCostCenter =
  | "operating_room"
  | "ambulance"
  | "emergency"
  | "hospitalization"
  | "icu"
  | "laboratory"
  | "imaging"
  | "pharmacy"
  | "administration"
  | "general";
declare type FinancialRecordStatus = "pending" | "approved" | "paid" | "cancelled" | "reimbursed";

declare interface FinancialTransaction {
  $id: string;
  transactionType: FinancialTransactionType;
  category: FinancialCategory;
  costCenter: FinancialCostCenter;
  sourceType?: string | null;
  sourceId?: string | null;
  patientId?: string | null;
  amount: number;
  taxAmount: number;
  deductibleAmount: number;
  currency: string;
  status: FinancialRecordStatus;
  description: string;
  occurredAt: Date | string;
  createdBy?: string | null;
  notes?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  patient?: {
    $id: string;
    name: string;
  } | null;
}

declare interface AmbulanceFuelLog {
  $id: string;
  ambulanceId: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerKm?: number | null;
  fueledAt: Date | string;
  stationName?: string | null;
  fueledBy?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  ambulance?: {
    $id: string;
    ambulanceNumber: string;
    licensePlate: string;
  } | null;
}
