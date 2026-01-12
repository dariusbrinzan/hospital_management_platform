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

export const Doctors = [
  {
    image: "/assets/images/dr-green.png",
    name: "Dr. Ion Popescu",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Dr. Maria Ionescu",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "Dr. Alexandru Georgescu",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Dr. Elena Radu",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Dr. Andrei Stanciu",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "Dr. Cristina Moldovan",
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "Dr. Florin Dumitrescu",
  },
  {
    image: "/assets/images/dr-cruz.png",
    name: "Dr. Ana-Maria Constantinescu",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Dr. Bogdan Nistor",
  },
  {
    image: "/assets/images/dr-green.png",
    name: "Dr. Ioana Petrescu",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Dr. Radu Vasilescu",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "Dr. Simona Marin",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Dr. Cătălin Olteanu",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Dr. Diana Gheorghe",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "Dr. Adrian Stoica",
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
