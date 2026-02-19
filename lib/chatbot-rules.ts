/**
 * Reguli clasice pentru chatbot (fără AI).
 * Fiecare regulă are: cuvinte cheie care pot activa răspunsul și un răspuns (poate conține placeholders pentru context).
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
  dynamicIntent?: "upcoming_appointments" | "recent_medical_history" | "active_medications" | "recent_lab_results" | "unread_notifications" | "allergies" | "recent_vaccinations" | "vital_signs";
}

const RULES: ChatRule[] = [
  {
    triggers: ["salut", "bună", "buna", "hello", "hi", "hey", "bună ziua", "buna ziua"],
    response: "Bună, {name}! Cu ce te pot ajuta astăzi?",
  },
  {
    triggers: ["ajutor", "help", "ajut", "nu știu", "nu stiu", "cum funcționează", "cum functioneaza"],
    response: "Te pot ghida cu: programări (cum faci, anulezi sau reprogramezi), istoric medical, calendar, profil medical, descărcare PDF consultații. Scrie o întrebare scurtă sau alege un subiect.",
  },
  {
    triggers: ["programare", "programări", "programari", "programez", "rezerv", "program", "când am programare", "cand am programare", "ce programări am", "ce programari am", "programările mele", "programarile mele", "vreau să văd programările", "vreau sa vad programarile"],
    response: "Programările se fac din **Dashboard** → \"Programare nouă\". Poți anula sau **reprograma** direct din lista de programări. Dacă ai programări viitoare, le vezi pe dashboard și în **Calendar**.",
    dynamicIntent: "upcoming_appointments",
  },
  {
    triggers: ["anulez", "anulare", "anula", "cancel", "renunț", "renunt"],
    response: "Pentru a anula o programare, intră în **Dashboard**, găsești programarea în lista \"Programări viitoare\" și alegi opțiunea de anulare. Vei putea introduce și motivul anulării.",
  },
  {
    triggers: ["reprogram", "reprogramez", "schimb data", "altă dată", "alta data", "mut programarea"],
    response: "Reprogramarea se face din **Dashboard**: la programarea pe care o vrei schimbată apasă \"Reprogramează\", alegi o nouă dată și interval orar disponibil.",
  },
  {
    triggers: ["istoric", "istoric medical", "consultații", "consultatii", "diagnostic", "diagnostice", "ultimele consultații", "ultimele consultatii", "consultații recente", "consultatii recente"],
    response: "Întregul istoric medical (consultații, diagnosticuri, rețete, analize) îl găsești la **Istoric Medical** din meniu. Acolo vezi și documentele încărcate.",
    dynamicIntent: "recent_medical_history",
  },
  {
    triggers: ["calendar", "calendar medical", "când am", "cand am", "programări săptămâna", "programari saptamana"],
    response: "În **Calendar** vezi toate programările, vaccinările și rețetele cu termen. Poți naviga lunar și vedea ce ai în fiecare zi.",
  },
  {
    triggers: ["pdf", "descarc", "descărcare", "consultatie", "concluzii", "raport"],
    response: "Poți descărca **PDF pentru fiecare consultație** (cu concluzii) din **Istoric Medical** — la fiecare consultație există butonul \"Descarcă PDF\". Dosarul medical complet (un singur PDF) se descarcă din **Dashboard** cu \"Descarcă dosar PDF\".",
  },
  {
    triggers: ["profil", "date personale", "alergii", "medicație", "medicatie", "stil de viață", "stil de viata"],
    response: "Datele personale, alergiile, medicația curentă și stilul de viață le editezi din **Profil Medical**. Acolo poți actualiza și contactul de urgență.",
  },
  {
    triggers: ["alergii", "alergie", "la ce sunt alergic", "ce alergii am"],
    response: "Alergiile tale sunt înregistrate în profilul medical. Verifică-le în **Profil Medical** → secțiunea Alergii.",
    dynamicIntent: "allergies",
  },
  {
    triggers: ["analize", "rezultate analize", "rezultate analize recente", "analize recente", "rezultate laborator"],
    response: "Rezultatele analizelor le vezi în **Istoric Medical** la fiecare consultație sau în secțiunea dedicată.",
    dynamicIntent: "recent_lab_results",
  },
  {
    triggers: ["notificări", "notificari", "mesaje noi", "notificări necitite", "notificari necitite", "ce notificări am"],
    response: "Notificările tale sunt disponibile în **Dashboard** în colțul din dreapta sus.",
    dynamicIntent: "unread_notifications",
  },
  {
    triggers: ["vaccinări", "vaccinari", "vaccin", "vaccinuri", "vaccinări recente", "vaccinari recente"],
    response: "Vaccinările tale sunt înregistrate în **Istoric Medical** și **Profil Medical**.",
    dynamicIntent: "recent_vaccinations",
  },
  {
    triggers: ["semne vitale", "tensiune", "puls", "temperatură", "temperatura", "greutate", "înălțime", "inaltime"],
    response: "Semnele vitale sunt înregistrate la fiecare consultație și le vezi în **Istoric Medical**.",
    dynamicIntent: "vital_signs",
  },
  {
    triggers: ["rețetă", "reteta", "rețete", "retete", "medicament", "medicamente", "tratament", "medicație curentă", "medicatie curenta", "ce medicamente iau", "ce medicamente iau acum", "medicamente active"],
    response: "Rețetele și tratamentele le vezi în **Istoric Medical** (la fiecare consultație) și în **Profil Medical** la secțiunea \"Medicație curentă\". În **Calendar** apar și rețetele cu termen de expirare.",
    dynamicIntent: "active_medications",
  },
  {
    triggers: ["evaluare", "evaluez", "rating", "doctor", "recenzie", "părere", "parere"],
    response: "După o consultație trecută, în **Dashboard** la programarea respectivă apare butonul **Evaluează**. Poți lăsa o notă (1–5 stele) și un comentariu. Evaluările sunt vizibile și altor pacienți la programare.",
  },
  {
    triggers: ["urgență", "urgent", "urgentă", "emergență", "emergenta"],
    response: "Pentru urgențe medicale contactează **112** sau mergi la cel mai apropiat serviciu de urgențe. Platforma eHealth.ro este pentru programări și gestionarea dosarului medical, nu pentru situații de urgență.",
  },
  {
    triggers: ["contact", "suport", "ajutor uman", "vorbesc cu cineva", "telefon", "email suport"],
    response: "Pentru suport tehnic sau întrebări despre cont, folosește datele de contact afișate pe site-ul spitalului/clinici. În aplicație poți verifica și datele din **Profil** (telefon, email).",
  },
  {
    triggers: ["mulțumesc", "multumesc", "mersi", "ok", "perfect", "super", "înțeles", "inteles"],
    response: "Cu plăcere! Dacă mai ai întrebări, scrie aici.",
  },
  {
    triggers: ["la revedere", "pa", "bye", "o zi bună", "o zi buna"],
    response: "La revedere! Să fii bine.",
  },
];

const DEFAULT_RESPONSE =
  "Nu am înțeles exact. Poți reformula întrebarea sau alege ce te interesează: programări, istoric medical, calendar, profil, PDF consultații sau evaluare doctor. Dacă ai nevoie de ajutor uman, folosește datele de contact ale clinicii.";

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
 * Match: mesajul normalizat conține cel puțin un trigger al unei reguli.
 * Returnează răspunsul și tipul de intenție dacă există.
 */
export function getReply(userMessage: string, context?: ChatContext | null): { reply: string; dynamicIntent?: string } {
  const normalized = userMessage.trim().toLowerCase();
  if (!normalized) return { reply: fillResponse("Scrie ceva și îți răspund. 😊", context) };

  for (const rule of RULES) {
    const matched = rule.triggers.some((t) => normalized.includes(t.toLowerCase()));
    if (matched) {
      return {
        reply: fillResponse(rule.response, context),
        dynamicIntent: rule.dynamicIntent,
      };
    }
  }

  return { reply: fillResponse(DEFAULT_RESPONSE, context) };
}
