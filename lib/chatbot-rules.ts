/**
 * Reguli clasice pentru chatbot (fără AI).
 * Fiecare regulă are: cuvinte cheie care pot activa răspunsul și un răspuns (poate conține placeholders pentru context).
 * Sistem de scoring pentru a găsi cel mai relevant răspuns.
 */

export type ChatContext = {
  name?: string;
  role?: "patient" | "admin" | "guest";
  nextAppointmentCount?: number;
  nextAppointmentDate?: string;
  hasUpcomingAppointment?: boolean;
};

export interface ChatRule {
  /** Cuvinte sau fraze care pot activa răspunsul (se face match case-insensitive) */
  triggers: string[];
  /** Răspunsul. Poate conține: {name}, {nextAppointmentCount}, {nextAppointmentDate} */
  response: string;
  /** Tip de intenție care necesită date reale din API */
  dynamicIntent?: "upcoming_appointments" | "recent_medical_history" | "active_medications" | "recent_lab_results" | "unread_notifications" | "allergies" | "recent_vaccinations" | "vital_signs" | "patient_info" | "insurance_info" | "emergency_contact" | "family_history" | "past_appointments";
  /** Prioritate pentru matching (mai mare = mai relevant) */
  priority?: number;
}

const RULES: ChatRule[] = [
  // Salutări
  {
    triggers: ["salut", "bună", "buna", "hello", "hi", "hey", "bună ziua", "buna ziua", "bună seara", "buna seara"],
    response: "Bună, {name}! Cu ce te pot ajuta astăzi?",
    priority: 10,
  },
  
  // Ajutor general
  {
    triggers: ["ajutor", "help", "ajut", "nu știu", "nu stiu", "cum funcționează", "cum functioneaza", "ce pot face", "ce pot sa fac"],
    response: "Te pot ghida cu: programări (cum faci, anulezi sau reprogramezi), istoric medical, calendar, profil medical, descărcare PDF consultații, medicamente, analize, alergii, vaccinări. Scrie o întrebare scurtă sau alege un subiect.",
    priority: 5,
  },
  
  // PROGRAMĂRI - trigger-uri extinse
  {
    triggers: ["programare", "programări", "programari", "programez", "rezerv", "program", "când am programare", "cand am programare", "ce programări am", "ce programari am", "programările mele", "programarile mele", "vreau să văd programările", "vreau sa vad programarile", "când am următoarea programare", "cand am urmatoarea programare", "următoarea programare", "urmatoarea programare", "când e programarea", "cand e programarea", "data programării", "data programarii"],
    response: "Programările se fac din **Dashboard** → \"Programare nouă\". Poți anula sau **reprograma** direct din lista de programări. Dacă ai programări viitoare, le vezi pe dashboard și în **Calendar**.",
    dynamicIntent: "upcoming_appointments",
    priority: 9,
  },
  {
    triggers: ["anulez", "anulare", "anula", "cancel", "renunț", "renunt", "vreau să anulez", "vreau sa anulez", "cum anulez", "cum anulez o programare"],
    response: "Pentru a anula o programare, intră în **Dashboard**, găsești programarea în lista \"Programări viitoare\" și alegi opțiunea de anulare. Vei putea introduce și motivul anulării.",
    priority: 8,
  },
  {
    triggers: ["reprogram", "reprogramez", "schimb data", "altă dată", "alta data", "mut programarea", "vreau să schimb", "vreau sa schimb", "modific programarea", "schimb programarea"],
    response: "Reprogramarea se face din **Dashboard**: la programarea pe care o vrei schimbată apasă \"Reprogramează\", alegi o nouă dată și interval orar disponibil.",
    priority: 8,
  },
  {
    triggers: ["programări trecute", "programari trecute", "programări anterioare", "programari anterioare", "istoric programări", "istoric programari"],
    response: "Programările tale trecute le vezi în **Dashboard** în secțiunea \"Programări trecute\" sau în **Istoric Medical**.",
    dynamicIntent: "past_appointments",
    priority: 7,
  },
  
  // ISTORIC MEDICAL - trigger-uri extinse
  {
    triggers: ["istoric", "istoric medical", "consultații", "consultatii", "diagnostic", "diagnostice", "ultimele consultații", "ultimele consultatii", "consultații recente", "consultatii recente", "ultima consultație", "ultima consultatie", "ce consultații am avut", "ce consultatii am avut", "consultațiile mele", "consultatii mele"],
    response: "Întregul istoric medical (consultații, diagnosticuri, rețete, analize) îl găsești la **Istoric Medical** din meniu. Acolo vezi și documentele încărcate.",
    dynamicIntent: "recent_medical_history",
    priority: 9,
  },
  
  // CALENDAR
  {
    triggers: ["calendar", "calendar medical", "când am", "cand am", "programări săptămâna", "programari saptamana", "ce am săptămâna asta", "ce am saptamana asta", "ce am luna asta", "ce am săptămâna viitoare", "ce am saptamana viitoare"],
    response: "În **Calendar** vezi toate programările, vaccinările și rețetele cu termen. Poți naviga lunar și vedea ce ai în fiecare zi.",
    priority: 7,
  },
  
  // PDF/DESCĂRCĂRI
  {
    triggers: ["pdf", "descarc", "descărcare", "consultatie", "concluzii", "raport", "vreau să descarc", "vreau sa descarc", "cum descarc", "descărcare pdf", "descarcare pdf", "dosar medical", "dosar pdf"],
    response: "Poți descărca **PDF pentru fiecare consultație** (cu concluzii) din **Istoric Medical** — la fiecare consultație există butonul \"Descarcă PDF\". Dosarul medical complet (un singur PDF) se descarcă din **Dashboard** cu \"Descarcă dosar PDF\".",
    priority: 7,
  },
  
  // PROFIL/DATE PERSONALE
  {
    triggers: ["profil", "date personale", "date mele", "informații personale", "informatii personale", "ce date am", "datele mele", "profilul meu"],
    response: "Datele personale, alergiile, medicația curentă și stilul de viață le editezi din **Profil Medical**. Acolo poți actualiza și contactul de urgență.",
    dynamicIntent: "patient_info",
    priority: 8,
  },
  {
    triggers: ["email", "adresă email", "adresa email", "emailul meu", "ce email am"],
    response: "Email-ul tău este înregistrat în **Profil Medical**. Poți să-l verifici sau actualizezi acolo.",
    dynamicIntent: "patient_info",
    priority: 6,
  },
  {
    triggers: ["telefon", "număr de telefon", "numar de telefon", "telefonul meu", "ce telefon am", "număr telefon", "numar telefon"],
    response: "Numărul tău de telefon este înregistrat în **Profil Medical**. Poți să-l verifici sau actualizezi acolo.",
    dynamicIntent: "patient_info",
    priority: 6,
  },
  {
    triggers: ["adresă", "adresa", "adresa mea", "unde locuiesc", "adresa de domiciliu"],
    response: "Adresa ta este înregistrată în **Profil Medical**. Poți să o verifici sau actualizezi acolo.",
    dynamicIntent: "patient_info",
    priority: 6,
  },
  
  // ALERGII
  {
    triggers: ["alergii", "alergie", "la ce sunt alergic", "ce alergii am", "sunt alergic", "am alergii", "alergii înregistrate", "alergii inregistrate"],
    response: "Alergiile tale sunt înregistrate în profilul medical. Verifică-le în **Profil Medical** → secțiunea Alergii.",
    dynamicIntent: "allergies",
    priority: 9,
  },
  
  // ANALIZE/REZULTATE LABORATOR
  {
    triggers: ["analize", "rezultate analize", "rezultate analize recente", "analize recente", "rezultate laborator", "analize de sânge", "analize de sange", "analize medicale", "rezultate test", "ce analize am", "analizele mele"],
    response: "Rezultatele analizelor le vezi în **Istoric Medical** la fiecare consultație sau în secțiunea dedicată.",
    dynamicIntent: "recent_lab_results",
    priority: 9,
  },
  
  // NOTIFICĂRI
  {
    triggers: ["notificări", "notificari", "mesaje noi", "notificări necitite", "notificari necitite", "ce notificări am", "mesaje", "alerts", "alertă", "alerta"],
    response: "Notificările tale sunt disponibile în **Dashboard** în colțul din dreapta sus.",
    dynamicIntent: "unread_notifications",
    priority: 8,
  },
  
  // VACCINĂRI
  {
    triggers: ["vaccinări", "vaccinari", "vaccin", "vaccinuri", "vaccinări recente", "vaccinari recente", "ce vaccinuri am", "vaccinurile mele", "vaccinare"],
    response: "Vaccinările tale sunt înregistrate în **Istoric Medical** și **Profil Medical**.",
    dynamicIntent: "recent_vaccinations",
    priority: 8,
  },
  
  // SEMNE VITALE
  {
    triggers: ["semne vitale", "tensiune", "puls", "temperatură", "temperatura", "greutate", "înălțime", "inaltime", "tensiune arterială", "tensiune arteriala", "presiune", "ce tensiune am", "ce greutate am", "ce înălțime am", "ce inaltime am"],
    response: "Semnele vitale sunt înregistrate la fiecare consultație și le vezi în **Istoric Medical**.",
    dynamicIntent: "vital_signs",
    priority: 8,
  },
  
  // MEDICAMENTE/REȚETE
  {
    triggers: ["rețetă", "reteta", "rețete", "retete", "medicament", "medicamente", "tratament", "medicație curentă", "medicatie curenta", "ce medicamente iau", "ce medicamente iau acum", "medicamente active", "tratament curent", "ce tratament am", "medicamentele mele"],
    response: "Rețetele și tratamentele le vezi în **Istoric Medical** (la fiecare consultație) și în **Profil Medical** la secțiunea \"Medicație curentă\". În **Calendar** apar și rețetele cu termen de expirare.",
    dynamicIntent: "active_medications",
    priority: 9,
  },
  
  // ASIGURARE MEDICALĂ
  {
    triggers: ["asigurare", "asigurare medicală", "asigurare medicala", "asigurator", "polita de asigurare", "polita mea", "ce asigurare am", "asigurarea mea"],
    response: "Informațiile despre asigurarea ta medicală sunt înregistrate în **Profil Medical**. Poți să le verifici acolo.",
    dynamicIntent: "insurance_info",
    priority: 7,
  },
  
  // CONTACT DE URGENȚĂ
  {
    triggers: ["contact urgență", "contact urgenta", "contact de urgență", "contact de urgenta", "persoană de contact", "persoana de contact", "cine e contactul meu", "cine este contactul meu", "persoană urgență", "persoana urgenta"],
    response: "Contactul tău de urgență este înregistrat în **Profil Medical**. Poți să-l verifici sau actualizezi acolo.",
    dynamicIntent: "emergency_contact",
    priority: 7,
  },
  
  // ISTORIC FAMILIAL
  {
    triggers: ["istoric familial", "istoric familie", "boli în familie", "boli in familie", "istoric medical familial", "ce boli sunt în familie", "ce boli sunt in familie"],
    response: "Istoricul medical familial este înregistrat în **Profil Medical** și **Istoric Medical**. Poți să-l verifici acolo.",
    dynamicIntent: "family_history",
    priority: 7,
  },
  
  // EVALUARE DOCTOR
  {
    triggers: ["evaluare", "evaluez", "rating", "doctor", "recenzie", "părere", "parere", "notă doctor", "nota doctor", "vreau să evaluez", "vreau sa evaluez", "cum evaluez"],
    response: "După o consultație trecută, în **Dashboard** la programarea respectivă apare butonul **Evaluează**. Poți lăsa o notă (1–5 stele) și un comentariu. Evaluările sunt vizibile și altor pacienți la programare.",
    priority: 6,
  },
  
  // URGENȚE
  {
    triggers: ["urgență", "urgent", "urgentă", "emergență", "emergenta", "am nevoie urgent", "situație urgentă", "situatie urgenta"],
    response: "Pentru urgențe medicale contactează **112** sau mergi la cel mai apropiat serviciu de urgențe. Platforma eHealth.ro este pentru programări și gestionarea dosarului medical, nu pentru situații de urgență.",
    priority: 10,
  },
  
  // CONTACT/SUPORT
  {
    triggers: ["contact", "suport", "ajutor uman", "vorbesc cu cineva", "telefon suport", "email suport", "cum contactez", "vreau să vorbesc", "vreau sa vorbesc"],
    response: "Pentru suport tehnic sau întrebări despre cont, folosește datele de contact afișate pe site-ul spitalului/clinici. În aplicație poți verifica și datele din **Profil** (telefon, email).",
    priority: 5,
  },
  
  // GRUP SANGUIN
  {
    triggers: ["grup sanguin", "grup de sânge", "grup de sange", "ce grup sanguin am", "grupul meu sanguin"],
    response: "Grupul tău sanguin este înregistrat în **Profil Medical**. Poți să-l verifici acolo.",
    dynamicIntent: "patient_info",
    priority: 6,
  },
  
  // BOLI CRONICE
  {
    triggers: ["boli cronice", "boli cronice", "ce boli am", "boli", "afecțiuni", "afectiuni", "diagnostic", "diagnostice"],
    response: "Boliile cronice și afecțiunile tale sunt înregistrate în **Profil Medical** și **Istoric Medical**. Poți să le verifici acolo.",
    priority: 7,
  },
  
  // INTERVENȚII CHIRURGICALE
  {
    triggers: ["operație", "operatie", "operații", "operatii", "intervenție chirurgicală", "interventie chirurgicala", "ce operații am avut", "ce operatii am avut"],
    response: "Intervențiile chirurgicale sunt înregistrate în **Profil Medical** și **Istoric Medical**. Poți să le verifici acolo.",
    priority: 7,
  },
  
  // STIL DE VIAȚĂ
  {
    triggers: ["stil de viață", "stil de viata", "fumător", "fumator", "alcool", "exerciții", "exercitii", "activitate fizică", "activitate fizica"],
    response: "Informațiile despre stilul tău de viață (fumat, alcool, exerciții) sunt înregistrate în **Profil Medical**. Poți să le verifici sau actualizezi acolo.",
    dynamicIntent: "patient_info",
    priority: 6,
  },
  
  // MULȚUMIRI
  {
    triggers: ["mulțumesc", "multumesc", "mersi", "ok", "perfect", "super", "înțeles", "inteles", "bine", "clar"],
    response: "Cu plăcere! Dacă mai ai întrebări, scrie aici.",
    priority: 3,
  },
  
  // LA REVEDERE
  {
    triggers: ["la revedere", "pa", "bye", "o zi bună", "o zi buna", "ne vedem", "pa pa"],
    response: "La revedere! Să fii bine.",
    priority: 3,
  },
];

const DEFAULT_RESPONSE =
  "Nu am înțeles exact. Poți reformula întrebarea sau alege ce te interesează: programări, istoric medical, calendar, profil, PDF consultații, medicamente, analize, alergii sau evaluare doctor. Dacă ai nevoie de ajutor uman, folosește datele de contact ale clinicii.";

/**
 * Calculează scorul de relevanță pentru o regulă bazat pe mesajul utilizatorului.
 * Returnează un scor mai mare pentru match-uri mai precise.
 */
function calculateMatchScore(rule: ChatRule, normalizedMessage: string): number {
  let score = rule.priority || 5;
  let matchedTriggers = 0;
  
  for (const trigger of rule.triggers) {
    const triggerLower = trigger.toLowerCase();
    if (normalizedMessage.includes(triggerLower)) {
      matchedTriggers++;
      // Bonus pentru match-uri exacte sau mai lungi
      if (normalizedMessage === triggerLower) {
        score += 10; // Match exact
      } else if (normalizedMessage.startsWith(triggerLower) || normalizedMessage.endsWith(triggerLower)) {
        score += 5; // Match la început sau sfârșit
      } else {
        score += 2; // Match parțial
      }
    }
  }
  
  // Bonus pentru mai multe trigger-uri match-uite
  if (matchedTriggers > 1) {
    score += matchedTriggers * 2;
  }
  
  return score;
}

/**
 * Înlocuiește placeholders în răspuns cu date din context.
 */
function fillResponse(response: string, context?: ChatContext | null): string {
  let out = response;
  if (context?.name) {
    out = out.replace(/\{name\}/g, context.name);
  } else {
    out = out.replace(/,?\s*\{name\}\s*/g, " ").replace(/\s+/g, " ").trim();
  }
  if (context?.nextAppointmentCount !== undefined)
    out = out.replace(/\{nextAppointmentCount\}/g, String(context.nextAppointmentCount));
  if (context?.nextAppointmentDate)
    out = out.replace(/\{nextAppointmentDate\}/g, context.nextAppointmentDate);
  return out.replace(/\*\*([^*]+)\*\*/g, "$1"); // bold -> plain
}

/**
 * Găsește răspunsul potrivit pentru mesajul utilizatorului.
 * Folosește scoring pentru a găsi cel mai relevant răspuns.
 * Returnează răspunsul și tipul de intenție dacă există.
 */
export function getReply(userMessage: string, context?: ChatContext | null): { reply: string; dynamicIntent?: string } {
  const normalized = userMessage.trim().toLowerCase();
  if (!normalized) return { reply: fillResponse("Scrie ceva și îți răspund. 😊", context) };

  // Calculează scoruri pentru toate regulile
  const scoredRules = RULES.map((rule) => ({
    rule,
    score: calculateMatchScore(rule, normalized),
  }))
    .filter((item) => item.score > (item.rule.priority || 5)) // Filtrează doar match-urile relevante
    .sort((a, b) => b.score - a.score); // Sortează descrescător după scor

  // Returnează răspunsul cu cel mai mare scor
  if (scoredRules.length > 0) {
    const bestMatch = scoredRules[0].rule;
    return {
      reply: fillResponse(bestMatch.response, context),
      dynamicIntent: bestMatch.dynamicIntent,
    };
  }

  // Dacă nu s-a găsit un match bun, returnează răspunsul implicit
  return { reply: fillResponse(DEFAULT_RESPONSE, context) };
}
