/**
 * Reguli clasice pentru chatbot (fără AI).
 * Suportă 3 roluri: patient, doctor, admin.
 */

export type ChatContext = {
  name?: string;
  role?: "patient" | "doctor" | "admin" | "guest";
  doctorName?: string;
  // patient-specific
  nextAppointmentCount?: number;
  nextAppointmentDate?: string;
  hasUpcomingAppointment?: boolean;
  // doctor-specific
  doctorAppointmentCount?: number;
  doctorPendingCount?: number;
  // admin-specific
  totalAppointments?: number;
  totalPatients?: number;
};

export interface ChatRule {
  triggers: string[];
  response: string;
  dynamicIntent?: string;
  priority?: number;
  roles?: ("patient" | "doctor" | "admin")[];
}

// ─── REGULI COMUNE ──────────────────────────────────────────
const COMMON_RULES: ChatRule[] = [
  {
    triggers: ["salut", "bună", "buna", "hello", "hi", "hey", "bună ziua", "buna ziua", "bună seara", "buna seara"],
    response: "Bună, {name}! Cu ce te pot ajuta astăzi?",
    priority: 10,
  },
  {
    triggers: ["mulțumesc", "multumesc", "mersi", "ok", "perfect", "super", "înțeles", "inteles", "bine", "clar"],
    response: "Cu plăcere! Dacă mai ai întrebări, scrie aici.",
    priority: 3,
  },
  {
    triggers: ["la revedere", "pa", "bye", "o zi bună", "o zi buna", "ne vedem", "pa pa"],
    response: "La revedere! Să fii bine.",
    priority: 3,
  },
  {
    triggers: ["urgență", "urgent", "urgentă", "emergență", "emergenta", "am nevoie urgent", "situație urgentă", "situatie urgenta"],
    response: "Pentru urgențe medicale contactează 112 sau mergi la cel mai apropiat serviciu de urgențe. Platforma eHealth.ro este pentru programări și gestionarea dosarului medical.",
    priority: 10,
  },
];

// ─── REGULI PACIENT ─────────────────────────────────────────
const PATIENT_RULES: ChatRule[] = [
  {
    triggers: ["ajutor", "help", "ajut", "nu știu", "nu stiu", "cum funcționează", "cum functioneaza", "ce pot face"],
    response: "Te pot ghida cu: programări, istoric medical, calendar, profil medical, rețete, analize, alergii, vaccinări. Scrie o întrebare scurtă.",
    priority: 5,
    roles: ["patient"],
  },
  {
    triggers: ["programare", "programări", "programari", "programez", "rezerv", "program", "când am programare", "cand am programare", "ce programări am", "programările mele", "programarile mele", "următoarea programare", "urmatoarea programare"],
    response: "Programările se fac din Dashboard → \"Programare nouă\". Poți anula sau reprograma direct din lista de programări.",
    dynamicIntent: "upcoming_appointments",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["anulez", "anulare", "anula", "cancel", "renunț", "renunt", "cum anulez"],
    response: "Pentru a anula o programare, intră în Dashboard, găsești programarea și alegi opțiunea de anulare.",
    priority: 8,
    roles: ["patient"],
  },
  {
    triggers: ["reprogram", "reprogramez", "schimb data", "altă dată", "alta data", "mut programarea"],
    response: "Reprogramarea se face din Dashboard: la programarea dorită apasă \"Reprogramează\", alegi o nouă dată și interval orar.",
    priority: 8,
    roles: ["patient"],
  },
  {
    triggers: ["programări trecute", "programari trecute", "programări anterioare", "programari anterioare", "istoric programări", "istoric programari"],
    response: "Programările trecute le vezi în Dashboard sau în Istoric Medical.",
    dynamicIntent: "past_appointments",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["istoric", "istoric medical", "consultații", "consultatii", "diagnostic", "diagnostice", "ultimele consultații", "ultima consultație"],
    response: "Întregul istoric medical îl găsești la Istoric Medical din meniu.",
    dynamicIntent: "recent_medical_history",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["calendar", "calendar medical", "ce am săptămâna", "ce am saptamana", "ce am luna"],
    response: "În Calendar vezi toate programările, vaccinările și rețetele cu termen.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["pdf", "descarc", "descărcare", "raport", "dosar medical", "dosar pdf"],
    response: "Poți descărca PDF pentru fiecare consultație din Istoric Medical. Dosarul complet se descarcă din Dashboard.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["profil", "date personale", "date mele", "informații personale", "profilul meu"],
    response: "Datele personale le editezi din Profil Medical.",
    dynamicIntent: "patient_info",
    priority: 8,
    roles: ["patient"],
  },
  {
    triggers: ["alergii", "alergie", "la ce sunt alergic", "ce alergii am", "sunt alergic"],
    response: "Alergiile tale sunt în Profil Medical → secțiunea Alergii.",
    dynamicIntent: "allergies",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["analize", "rezultate analize", "analize recente", "rezultate laborator", "analize de sânge", "analize de sange", "analize medicale", "analizele mele"],
    response: "Rezultatele analizelor le vezi la Analize Medicale din meniu.",
    dynamicIntent: "recent_lab_results",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["notificări", "notificari", "mesaje noi", "notificări necitite", "ce notificări am"],
    response: "Notificările sunt în colțul din dreapta sus.",
    dynamicIntent: "unread_notifications",
    priority: 8,
    roles: ["patient"],
  },
  {
    triggers: ["vaccinări", "vaccinari", "vaccin", "vaccinuri", "ce vaccinuri am", "vaccinurile mele"],
    response: "Vaccinările tale sunt în Profil Medical și Istoric Medical.",
    dynamicIntent: "recent_vaccinations",
    priority: 8,
    roles: ["patient"],
  },
  {
    triggers: ["semne vitale", "tensiune", "puls", "temperatură", "temperatura", "greutate", "înălțime", "inaltime"],
    response: "Semnele vitale se înregistrează la fiecare consultație și le vezi în Istoric Medical.",
    dynamicIntent: "vital_signs",
    priority: 8,
    roles: ["patient"],
  },
  {
    triggers: ["rețetă", "reteta", "rețete", "retete", "medicament", "medicamente", "tratament", "medicație curentă", "medicatie curenta", "ce medicamente iau", "medicamentele mele"],
    response: "Rețetele le vezi la Rețete din meniu sau în Profil Medical.",
    dynamicIntent: "active_medications",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["asigurare", "asigurare medicală", "asigurare medicala", "asigurator", "ce asigurare am"],
    response: "Informațiile despre asigurare sunt în Profil Medical.",
    dynamicIntent: "insurance_info",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["contact urgență", "contact urgenta", "contact de urgență", "persoană de contact"],
    response: "Contactul de urgență este în Profil Medical.",
    dynamicIntent: "emergency_contact",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["istoric familial", "boli în familie", "boli in familie", "istoric medical familial"],
    response: "Istoricul familial este în Profil Medical.",
    dynamicIntent: "family_history",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["evaluare", "evaluez", "rating", "recenzie", "notă doctor", "nota doctor"],
    response: "După o consultație trecută, în Dashboard la programarea respectivă apare butonul Evaluează.",
    priority: 6,
    roles: ["patient"],
  },
  {
    triggers: ["harta", "hartă", "hartă spital", "harta spital", "unde e cabinetul", "unde este cabinetul", "etaj", "cabinet"],
    response: "Harta interactivă a spitalului este accesibilă din Hartă Spital în meniu. Poți vedea cabinetul și etajul fiecărui medic.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["mesaje", "mesaj", "trimit mesaj", "scriu doctorului", "mesaj doctor"],
    response: "Mesajele le trimiți din secțiunea Mesaje din meniu, legate de o programare specifică.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["grup sanguin", "grup de sânge", "grup de sange", "ce grup sanguin am"],
    response: "Grupul sanguin este în Profil Medical.",
    dynamicIntent: "patient_info",
    priority: 6,
    roles: ["patient"],
  },
  {
    triggers: ["boli cronice", "ce boli am", "afecțiuni", "afectiuni"],
    response: "Bolile cronice sunt în Profil Medical și Istoric Medical.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["operație", "operatie", "intervenție chirurgicală", "interventie chirurgicala"],
    response: "Intervențiile chirurgicale sunt în Profil Medical.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["stil de viață", "stil de viata", "fumător", "fumator", "alcool", "exerciții", "exercitii"],
    response: "Stilul de viață (fumat, alcool, exerciții) este în Profil Medical.",
    dynamicIntent: "patient_info",
    priority: 6,
    roles: ["patient"],
  },
  {
    triggers: ["raportez", "raportare", "raportează", "raportez problemă", "raportez problema", "problemă", "problema"],
    response: "Poți raporta o problemă din secțiunea Raportează o problemă din meniu.",
    priority: 6,
    roles: ["patient"],
  },
];

// ─── REGULI DOCTOR ──────────────────────────────────────────
const DOCTOR_RULES: ChatRule[] = [
  {
    triggers: ["ajutor", "help", "ajut", "ce pot face", "cum funcționează", "cum functioneaza"],
    response: "Ca medic, poți: vedea programările, consulta istoricul pacienților, trimite mesaje, adăuga consultații, prescrie rețete. Scrie un subiect.",
    priority: 5,
    roles: ["doctor"],
  },
  {
    triggers: ["programare", "programări", "programari", "programările mele", "programarile mele", "ce programări am", "câte programări", "cate programari"],
    response: "Programările tale sunt pe pagina principală (Dashboard). Poți vedea confirmări, în așteptare și anulate.",
    dynamicIntent: "doctor_appointments",
    priority: 9,
    roles: ["doctor"],
  },
  {
    triggers: ["pacienți", "pacienti", "pacienții mei", "pacientii mei", "câți pacienți", "cati pacienti", "lista pacienți", "lista pacienti", "istoric pacienți", "istoric pacienti"],
    response: "Lista tuturor pacienților tăi este la Istoric pacienți din meniu. Apasă pe un pacient pentru detalii complete.",
    dynamicIntent: "doctor_patients",
    priority: 9,
    roles: ["doctor"],
  },
  {
    triggers: ["mesaje", "mesaj", "mesaje pacienți", "mesaje pacienti", "mesaje noi", "mesaje necitite", "am mesaje"],
    response: "Mesajele de la pacienți sunt în secțiunea Mesaje din meniu.",
    dynamicIntent: "doctor_messages",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["consultație", "consultatie", "adaug consultație", "adaug consultatie", "consultație nouă", "consultatie noua", "cum adaug"],
    response: "Pentru a adăuga o consultație, din tabelul de programări apasă butonul Adaugă/Editează Consultație la programarea dorită. Poți completa diagnostice, rețete și semne vitale.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["rețetă", "reteta", "prescriu", "prescrie", "medicamente", "medicament", "tratament"],
    response: "Rețetele se adaugă din formularul de consultație (pas 3). Completează medicamentul, doza, frecvența și instrucțiunile.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["profil", "profilul meu", "date medic", "datele mele", "specializare"],
    response: "Profilul tău de medic este accesibil din click pe numele tău din bara de sus.",
    dynamicIntent: "doctor_profile",
    priority: 7,
    roles: ["doctor"],
  },
  {
    triggers: ["statistici", "statistică", "statistica", "câte programări confirmate", "cate programari confirmate", "în așteptare", "in asteptare", "anulate"],
    response: "Statisticile rapide (confirmate, în așteptare, anulate) le vezi pe Dashboard.",
    dynamicIntent: "doctor_stats",
    priority: 7,
    roles: ["doctor"],
  },
  {
    triggers: ["notificări", "notificari", "alertă", "alerta", "clopotel", "clopoțel"],
    response: "Notificările le vezi în clopotelul din colțul dreapta-sus.",
    dynamicIntent: "doctor_notifications",
    priority: 7,
    roles: ["doctor"],
  },
  {
    triggers: ["deconectare", "logout", "ieși", "iesi", "deconecteaz"],
    response: "Te poți deconecta din butonul Deconectare din bara de sus, dreapta.",
    priority: 5,
    roles: ["doctor"],
  },
];

// ─── REGULI ADMIN ───────────────────────────────────────────
const ADMIN_RULES: ChatRule[] = [
  {
    triggers: ["ajutor", "help", "ajut", "ce pot face", "cum funcționează", "cum functioneaza"],
    response: "Ca administrator, poți gestiona: programări, pacienți, medici de gardă, urgențe, ATI, internări, medicamente, echipamente, transport, rapoarte. Scrie un subiect.",
    priority: 5,
    roles: ["admin"],
  },
  {
    triggers: ["programare", "programări", "programari", "câte programări", "cate programari", "programări totale", "programari totale", "toate programările", "toate programarile"],
    response: "Vizualizarea tuturor programărilor este pe Dashboard. Poți filtra pe specializare și medic din sidebar.",
    dynamicIntent: "admin_appointments",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["pacienți", "pacienti", "câți pacienți", "cati pacienti", "total pacienți", "total pacienti", "lista pacienți", "lista pacienti"],
    response: "Lista completă a pacienților este în secțiunea Pacienți din sidebar.",
    dynamicIntent: "admin_patients",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["urgențe", "urgente", "urgență", "urgenta", "cazuri urgență", "cazuri urgenta", "caz urgență", "caz urgenta", "UPU"],
    response: "Cazurile de urgență active sunt în secțiunea Urgențe din sidebar.",
    dynamicIntent: "admin_emergencies",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["ATI", "ati", "terapie intensivă", "terapie intensiva", "paturi ATI", "locuri ATI", "locuri ati"],
    response: "Statusul ATI (paturi, pacienți, echipamente) este în secțiunea ATI din sidebar.",
    dynamicIntent: "admin_icu",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["internare", "internări", "internari", "pacienți internați", "pacienti internati", "admisii", "externare"],
    response: "Internările active sunt în secțiunea Internări din sidebar.",
    dynamicIntent: "admin_admissions",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["medicamente", "medicament", "stoc", "stocuri", "medicamente stoc", "farmacie", "reaprovizionare"],
    response: "Stocurile de medicamente sunt în secțiunea Medicamente din sidebar. Poți vedea alertele de stoc scăzut.",
    dynamicIntent: "admin_medications",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["echipament", "echipamente", "aparatură", "aparatura", "dispozitiv", "dispozitive"],
    response: "Echipamentele medicale sunt în secțiunea Echipamente din sidebar.",
    dynamicIntent: "admin_equipment",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["transport", "ambulanță", "ambulanta", "ambulanțe", "ambulante", "misiuni", "misiune"],
    response: "Ambulanțele și misiunile de transport sunt în secțiunea Ambulanțe din sidebar.",
    dynamicIntent: "admin_transport",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["gardă", "garda", "medici de gardă", "medici de garda", "cine e de gardă", "cine e de garda"],
    response: "Medicii de gardă sunt gestionați din secțiunea Medici de gardă din sidebar.",
    dynamicIntent: "admin_on_duty",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["rapoarte", "raport", "probleme raportate", "probleme", "reclamații", "reclamatii"],
    response: "Problemele raportate sunt în secțiunea Rapoarte probleme din sidebar.",
    dynamicIntent: "admin_reports",
    priority: 7,
    roles: ["admin"],
  },
  {
    triggers: ["imagistică", "imagistica", "investigații", "investigatii", "RMN", "CT", "ecografie", "radiografie"],
    response: "Investigațiile imagistice sunt în secțiunea Imagistică din sidebar.",
    dynamicIntent: "admin_imaging",
    priority: 7,
    roles: ["admin"],
  },
  {
    triggers: ["consumabile", "cereri consumabile", "consumabil"],
    response: "Cererile de consumabile sunt în secțiunea Consumabile din sidebar.",
    priority: 7,
    roles: ["admin"],
  },
  {
    triggers: ["statistici", "statistică", "statistica", "overview", "rezumat", "sumar"],
    response: "Dashboard-ul principal arată un rezumat cu preview din fiecare secțiune.",
    dynamicIntent: "admin_stats",
    priority: 7,
    roles: ["admin"],
  },
];

// Combină toate regulile
const ALL_RULES = [...COMMON_RULES, ...PATIENT_RULES, ...DOCTOR_RULES, ...ADMIN_RULES];

const DEFAULT_RESPONSES: Record<string, string> = {
  patient: "Nu am înțeles exact. Poți întreba despre: programări, istoric medical, rețete, analize, calendar, profil, alergii, vaccinări sau mesaje.",
  doctor: "Nu am înțeles exact. Poți întreba despre: programări, pacienți, mesaje, consultații, rețete, profil sau statistici.",
  admin: "Nu am înțeles exact. Poți întreba despre: programări, pacienți, urgențe, ATI, internări, medicamente, echipamente, transport, rapoarte sau statistici.",
  guest: "Nu am înțeles exact. Te rog să te autentifici pentru a putea accesa informații personalizate.",
};

function calculateMatchScore(rule: ChatRule, normalizedMessage: string): number {
  let score = rule.priority || 5;
  let matchedTriggers = 0;

  for (const trigger of rule.triggers) {
    const triggerLower = trigger.toLowerCase();
    if (normalizedMessage.includes(triggerLower)) {
      matchedTriggers++;
      if (normalizedMessage === triggerLower) {
        score += 10;
      } else if (normalizedMessage.startsWith(triggerLower) || normalizedMessage.endsWith(triggerLower)) {
        score += 5;
      } else {
        score += 2;
      }
    }
  }

  if (matchedTriggers > 1) {
    score += matchedTriggers * 2;
  }

  return score;
}

function fillResponse(response: string, context?: ChatContext | null): string {
  let out = response;
  if (context?.name) {
    out = out.replace(/\{name\}/g, context.name);
  } else if (context?.doctorName) {
    out = out.replace(/\{name\}/g, context.doctorName);
  } else {
    out = out.replace(/,?\s*\{name\}\s*/g, " ").replace(/\s+/g, " ").trim();
  }
  if (context?.nextAppointmentCount !== undefined)
    out = out.replace(/\{nextAppointmentCount\}/g, String(context.nextAppointmentCount));
  if (context?.nextAppointmentDate)
    out = out.replace(/\{nextAppointmentDate\}/g, context.nextAppointmentDate);
  return out.replace(/\*\*([^*]+)\*\*/g, "$1");
}

export function getReply(
  userMessage: string,
  context?: ChatContext | null
): { reply: string; dynamicIntent?: string } {
  const normalized = userMessage.trim().toLowerCase();
  if (!normalized) return { reply: fillResponse("Scrie ceva și îți răspund.", context) };

  const role = context?.role || "guest";

  const applicableRules = ALL_RULES.filter(
    (rule) => !rule.roles || rule.roles.includes(role as any)
  );

  const scoredRules = applicableRules
    .map((rule) => ({
      rule,
      score: calculateMatchScore(rule, normalized),
    }))
    .filter((item) => item.score > (item.rule.priority || 5))
    .sort((a, b) => b.score - a.score);

  if (scoredRules.length > 0) {
    const bestMatch = scoredRules[0].rule;
    return {
      reply: fillResponse(bestMatch.response, context),
      dynamicIntent: bestMatch.dynamicIntent,
    };
  }

  return { reply: fillResponse(DEFAULT_RESPONSES[role] || DEFAULT_RESPONSES.guest, context) };
}
