import { z } from "zod";

export const UserFormValidation = z.object({
  name: z
    .string()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele trebuie să aibă cel mult 50 de caractere"),
  email: z.string().email("Adresă email invalidă"),
  password: z
    .string()
    .min(6, "Parola trebuie să aibă cel puțin 6 caractere")
    .max(100, "Parola trebuie să aibă cel mult 100 de caractere"),
});

export const PatientFormValidation = z.object({
  name: z
    .string()
    .min(2, "Numele trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele trebuie să aibă cel mult 50 de caractere"),
  email: z.string().email("Adresă email invalidă"),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Număr de telefon invalid"),
  birthDate: z.coerce.date(),
  gender: z.enum(["Bărbat", "Femeie"]),
  address: z
    .string()
    .min(5, "Adresa trebuie să aibă cel puțin 5 caractere")
    .max(500, "Adresa trebuie să aibă cel mult 500 de caractere"),
  occupation: z
    .string()
    .min(2, "Ocupația trebuie să aibă cel puțin 2 caractere")
    .max(500, "Ocupația trebuie să aibă cel mult 500 de caractere"),
  emergencyContactName: z
    .string()
    .min(2, "Numele contactului trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele contactului trebuie să aibă cel mult 50 de caractere"),
  emergencyContactNumber: z
    .string()
    .refine(
      (emergencyContactNumber) => /^\+\d{10,15}$/.test(emergencyContactNumber),
      "Număr de telefon invalid"
    ),
  primaryPhysician: z.string().min(2, "Selectați cel puțin un doctor"),
  insuranceProvider: z
    .string()
    .min(2, "Numele asigurătorului trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numele asigurătorului trebuie să aibă cel mult 50 de caractere"),
  insurancePolicyNumber: z
    .string()
    .min(2, "Numărul poliței trebuie să aibă cel puțin 2 caractere")
    .max(50, "Numărul poliței trebuie să aibă cel mult 50 de caractere"),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  identificationType: z.string().optional(),
  identificationNumber: z.string().optional(),
  identificationDocument: z.custom<File[]>().optional(),
  bloodType: z.string().optional(),
  height: z.coerce.number().min(50).max(250).optional(),
  weight: z.coerce.number().min(1).max(300).optional(),
  cardiovascularDiseases: z.string().optional(),
  chronicDiseases: z.string().optional(),
  surgeries: z.string().optional(),
  vaccinations: z.string().optional(),
  smokingStatus: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  exerciseFrequency: z.string().optional(),
  treatmentConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "Trebuie să consimțiți la tratament pentru a continua",
    }),
  disclosureConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "Trebuie să consimțiți la divulgare pentru a continua",
    }),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "Trebuie să consimțiți la confidențialitate pentru a continua",
    }),
});

export const CreateAppointmentSchema = z.object({
  primaryPhysician: z.string().optional(), // Opțional pentru că poate fi "Analize medicale" fără doctor
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Motivul trebuie să aibă cel puțin 2 caractere")
    .max(500, "Motivul trebuie să aibă cel mult 500 de caractere")
    .optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
  analysisPackage: z.string().optional(), // Pachet de analize (opțional)
  isInsured: z.boolean().default(false), // Status asigurare CASMB
  appointmentType: z.enum(["in_person", "video"]).default("in_person"), // Tip programare: la cabinet sau videoconferință
}).refine((data) => {
  // Dacă nu este pachet de analize, trebuie să existe doctor
  if (!data.analysisPackage && !data.primaryPhysician) {
    return false;
  }
  return true;
}, {
  message: "Selectați fie un doctor, fie un pachet de analize",
  path: ["primaryPhysician"],
});

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Selectați cel puțin un doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Selectați cel puțin un doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "Motivul trebuie să aibă cel puțin 2 caractere")
    .max(500, "Motivul trebuie să aibă cel mult 500 de caractere"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}
