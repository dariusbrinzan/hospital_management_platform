export const GenderOptions = ["Bărbat", "Femeie"];

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
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
