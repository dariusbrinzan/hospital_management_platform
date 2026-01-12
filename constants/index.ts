export const GenderOptions = ["Bărbat", "Femeie"];

export const BloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Necunoscută"];

export const SmokingStatusOptions = [
  "Nefumător",
  "Fumător activ",
  "Fumător ocazional",
  "Fost fumător",
];

export const AlcoholConsumptionOptions = [
  "Nu consumă",
  "Consum ocazional",
  "Consum moderat",
  "Consum frecvent",
];

export const ExerciseFrequencyOptions = [
  "Nu fac exerciții",
  "Rar (1-2 ori/lună)",
  "Ocazional (1-2 ori/săptămână)",
  "Frecvent (3-5 ori/săptămână)",
  "Zilnic",
];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Bărbat" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Card de identitate (CI)",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
  bloodType: "",
  height: undefined,
  weight: undefined,
  cardiovascularDiseases: "",
  chronicDiseases: "",
  surgeries: "",
  vaccinations: "",
  smokingStatus: "",
  alcoholConsumption: "",
  exerciseFrequency: "",
};

export const IdentificationTypes = [
  "Card de identitate (CI)",
  "Pașaport",
  "Card de sănătate",
  "CNP (Cod Numeric Personal)",
  "Permis de conducere",
  "Certificat de naștere",
  "Carte de identitate provizorie",
];

// Specializări medicale
export const MedicalSpecialties = [
  "Cardiologie",
  "Dermatologie",
  "Endocrinologie",
  "Gastroenterologie",
  "Neurologie",
  "Oftalmologie",
  "Ortopedie",
  "Pediatrie",
  "Psihiatrie",
  "Urologie",
  "Analize medicale",
];

// Pachete de analize medicale
export interface AnalysisPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  specialties: string[]; // Specializările pentru care este disponibil
  gender?: "Bărbat" | "Femeie" | "Ambele"; // Genul pentru care este disponibil
  tests: string[]; // Lista de analize incluse
}

export const AnalysisPackages: AnalysisPackage[] = [
  // Pachete generale
  {
    id: "general-complete",
    name: "Pachet Analize Complete",
    description: "Set complet de analize de bază pentru evaluarea generală a sănătății",
    price: 250,
    specialties: ["Analize medicale"],
    gender: "Ambele",
    tests: [
      "Hemoleucogramă completă",
      "Glicemie",
      "Colesterol total",
      "HDL colesterol",
      "LDL colesterol",
      "Trigliceride",
      "Creatinină",
      "Uree",
      "ALT (GPT)",
      "AST (GOT)",
      "TSH",
      "FT4",
      "Vitamina D",
      "Vitamina B12",
      "Acid folic",
    ],
  },
  {
    id: "general-basic",
    name: "Pachet Analize de Bază",
    description: "Set minim de analize pentru screening general",
    price: 120,
    specialties: ["Analize medicale"],
    gender: "Ambele",
    tests: [
      "Hemoleucogramă",
      "Glicemie",
      "Colesterol total",
      "Creatinină",
      "TSH",
    ],
  },
  // Pachete pentru bărbați
  {
    id: "male-complete",
    name: "Pachet Analize Complete - Bărbați",
    description: "Set complet de analize specifice pentru bărbați",
    price: 350,
    specialties: ["Analize medicale", "Urologie"],
    gender: "Bărbat",
    tests: [
      "Hemoleucogramă completă",
      "Glicemie",
      "Colesterol total",
      "HDL colesterol",
      "LDL colesterol",
      "Trigliceride",
      "PSA total",
      "PSA liber",
      "Testosteron",
      "Creatinină",
      "Uree",
      "ALT (GPT)",
      "AST (GOT)",
      "TSH",
      "FT4",
    ],
  },
  {
    id: "male-prostate",
    name: "Pachet Screening Prostată",
    description: "Analize specifice pentru evaluarea sănătății prostatice",
    price: 180,
    specialties: ["Analize medicale", "Urologie"],
    gender: "Bărbat",
    tests: [
      "PSA total",
      "PSA liber",
      "Raport PSA liber/PSA total",
      "Creatinină",
    ],
  },
  // Pachete pentru femei
  {
    id: "female-complete",
    name: "Pachet Analize Complete - Femei",
    description: "Set complet de analize specifice pentru femei",
    price: 380,
    specialties: ["Analize medicale", "Ginecologie"],
    gender: "Femeie",
    tests: [
      "Hemoleucogramă completă",
      "Glicemie",
      "Colesterol total",
      "HDL colesterol",
      "LDL colesterol",
      "Trigliceride",
      "Creatinină",
      "Uree",
      "ALT (GPT)",
      "AST (GOT)",
      "TSH",
      "FT4",
      "Estradiol",
      "Progesteron",
      "Testosteron",
      "Vitamina D",
      "Feritină",
    ],
  },
  {
    id: "female-hormonal",
    name: "Pachet Analize Hormonale - Femei",
    description: "Evaluare hormonală completă pentru femei",
    price: 280,
    specialties: ["Analize medicale", "Ginecologie", "Endocrinologie"],
    gender: "Femeie",
    tests: [
      "TSH",
      "FT4",
      "FT3",
      "Estradiol",
      "Progesteron",
      "Testosteron",
      "Prolactină",
      "FSH",
      "LH",
    ],
  },
  {
    id: "female-pregnancy",
    name: "Pachet Analize Sarcina",
    description: "Analize pentru monitorizarea sarcinii",
    price: 320,
    specialties: ["Analize medicale", "Ginecologie"],
    gender: "Femeie",
    tests: [
      "Hemoleucogramă completă",
      "Glicemie",
      "TSH",
      "FT4",
      "Vitamina D",
      "Acid folic",
      "Feritină",
      "Grupa sanguină și Rh",
      "Anticorpi anti-Rh",
    ],
  },
  // Pachete pentru specializări specifice
  {
    id: "cardiology",
    name: "Pachet Analize Cardiologice",
    description: "Evaluare completă a sănătății cardiovasculare",
    price: 300,
    specialties: ["Analize medicale", "Cardiologie"],
    gender: "Ambele",
    tests: [
      "Hemoleucogramă",
      "Glicemie",
      "Colesterol total",
      "HDL colesterol",
      "LDL colesterol",
      "Trigliceride",
      "Homocisteină",
      "NT-proBNP",
      "Troponină",
      "Creatinină",
      "Uree",
    ],
  },
  {
    id: "endocrinology",
    name: "Pachet Analize Endocrinologice",
    description: "Evaluare completă a funcției endocrine",
    price: 350,
    specialties: ["Analize medicale", "Endocrinologie"],
    gender: "Ambele",
    tests: [
      "TSH",
      "FT4",
      "FT3",
      "Anticorpi anti-TPO",
      "Anticorpi anti-TG",
      "Cortizol",
      "Insulină",
      "HbA1c",
      "Vitamina D",
      "Calciu",
      "Fosfor",
    ],
  },
  {
    id: "gastroenterology",
    name: "Pachet Analize Gastroenterologice",
    description: "Evaluare completă a funcției digestive",
    price: 320,
    specialties: ["Analize medicale", "Gastroenterologie"],
    gender: "Ambele",
    tests: [
      "Hemoleucogramă",
      "ALT (GPT)",
      "AST (GOT)",
      "GGT",
      "Fosfatază alcalină",
      "Bilirubină totală",
      "Bilirubină directă",
      "Amilază",
      "Lipază",
      "Creatinină",
      "Uree",
    ],
  },
  {
    id: "dermatology",
    name: "Pachet Analize Dermatologice",
    description: "Analize pentru evaluarea sănătății pielii",
    price: 280,
    specialties: ["Analize medicale", "Dermatologie"],
    gender: "Ambele",
    tests: [
      "Hemoleucogramă",
      "Vitamina D",
      "Vitamina B12",
      "Acid folic",
      "Feritină",
      "Zinc",
      "Seleniu",
      "TSH",
      "FT4",
    ],
  },
];

export const Doctors = [
  {
    image: "/assets/images/dr-green.png",
    name: "Dr. Ion Popescu",
    specialty: "Cardiologie",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Dr. Maria Ionescu",
    specialty: "Dermatologie",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "Dr. Alexandru Georgescu",
    specialty: "Endocrinologie",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Dr. Elena Radu",
    specialty: "Gastroenterologie",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Dr. Andrei Stanciu",
    specialty: "Neurologie",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "Dr. Cristina Moldovan",
    specialty: "Oftalmologie",
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "Dr. Florin Dumitrescu",
    specialty: "Ortopedie",
  },
  {
    image: "/assets/images/dr-cruz.png",
    name: "Dr. Ana-Maria Constantinescu",
    specialty: "Pediatrie",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Dr. Bogdan Nistor",
    specialty: "Psihiatrie",
  },
  {
    image: "/assets/images/dr-green.png",
    name: "Dr. Ioana Petrescu",
    specialty: "Urologie",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Dr. Radu Vasilescu",
    specialty: "Cardiologie",
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "Dr. Mihai Tănase",
    specialty: "Cardiologie",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "Dr. Simona Marin",
    specialty: "Dermatologie",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Dr. Cătălin Olteanu",
    specialty: "Endocrinologie",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Dr. Diana Gheorghe",
    specialty: "Gastroenterologie",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "Dr. Adrian Stoica",
    specialty: "Neurologie",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Dr. Laura Popa",
    specialty: "Analize medicale",
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
