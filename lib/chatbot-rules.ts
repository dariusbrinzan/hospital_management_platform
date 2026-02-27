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
    triggers: ["ajutor", "help", "ajut", "nu știu", "nu stiu", "cum funcționează", "cum functioneaza", "ce pot face", "ce oferă", "ce ofera"],
    response: "Te pot ghida cu: programări (nouă, anulare, reprogramare), istoric medical, consultații, rețete, analize medicale, calendar, profil medical (alergii, vaccinări, date personale), hartă spital, mesaje, raportare problemă, notificări, PDF/raport consultație. Scrie o întrebare scurtă.",
    priority: 5,
    roles: ["patient"],
  },
  {
    triggers: ["programare nouă", "programare noua", "vreau programare", "fac programare", "rezerv programare", "programez", "programare la medic"],
    response: "Programarea nouă se face din butonul \"Programare nouă\" din header sau din Dashboard. Alegi medicul, data și motivul.",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["programare", "programări", "programari", "rezerv", "program", "când am programare", "cand am programare", "ce programări am", "programările mele", "programarile mele", "următoarea programare", "urmatoarea programare"],
    response: "Programările le vezi în Dashboard. Poți face programare nouă, anula sau reprograma din listă.",
    dynamicIntent: "upcoming_appointments",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["anulez", "anulare", "anula", "cancel", "renunț", "renunt", "cum anulez programare"],
    response: "Pentru a anula o programare, intră în Dashboard, găsești programarea și alegi opțiunea de anulare.",
    priority: 8,
    roles: ["patient"],
  },
  {
    triggers: ["reprogram", "reprogramez", "schimb data", "altă dată", "alta data", "mut programarea", "schimb programarea"],
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
    triggers: ["istoric", "istoric medical", "consultații", "consultatii", "diagnostic", "diagnostice", "ultimele consultații", "ultima consultație", "consultații trecute"],
    response: "Întregul istoric medical (consultații, diagnostice) îl găsești la Istoric Medical din meniu. Poți descărca raport PDF per consultație.",
    dynamicIntent: "recent_medical_history",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["calendar", "calendar medical", "ce am săptămâna", "ce am saptamana", "ce am luna", "calendar programări"],
    response: "În Calendar vezi programările, vaccinările și rețetele cu termen. Acces din meniul lateral.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["pdf", "descarc", "descărcare", "raport", "dosar medical", "dosar pdf", "descarc raport", "raport consultație", "raport consultatie"],
    response: "Poți descărca PDF pentru fiecare consultație din Istoric Medical (buton la fiecare consultație). Dosarul medical complet se descarcă din Dashboard.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["profil", "date personale", "date mele", "informații personale", "profilul meu", "editez date"],
    response: "Datele personale le editezi din Profil Medical: identificare, contact, asigurare, alergii, vaccinări, istoric familial, stil de viață.",
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
    triggers: ["analize", "rezultate analize", "analize recente", "rezultate laborator", "analize de sânge", "analize de sange", "analize medicale", "analizele mele", "rezultate analize"],
    response: "Rezultatele analizelor le vezi la Analize Medicale din meniu.",
    dynamicIntent: "recent_lab_results",
    priority: 9,
    roles: ["patient"],
  },
  {
    triggers: ["notificări", "notificari", "mesaje noi", "notificări necitite", "ce notificări am", "alerte"],
    response: "Notificările sunt în colțul din dreapta sus (clopotel). Poți vedea toate notificările din pagina Notificări.",
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
    triggers: ["semne vitale", "tensiune", "puls", "temperatură", "temperatura", "greutate", "înălțime", "inaltime", "BMI"],
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
    triggers: ["asigurare", "asigurare medicală", "asigurare medicala", "asigurator", "ce asigurare am", "poliță", "polita"],
    response: "Informațiile despre asigurare (asigurator, poliță) sunt în Profil Medical.",
    dynamicIntent: "insurance_info",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["contact urgență", "contact urgenta", "contact de urgență", "persoană de contact", "contact urgență"],
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
    triggers: ["evaluare", "evaluez", "rating", "recenzie", "notă doctor", "nota doctor", "evaluez medic"],
    response: "După o consultație trecută, în Dashboard la programarea respectivă apare butonul Evaluează (rating și eventual comentariu).",
    priority: 6,
    roles: ["patient"],
  },
  {
    triggers: ["harta", "hartă", "hartă spital", "harta spital", "unde e cabinetul", "unde este cabinetul", "etaj", "cabinet", "locație spital", "locatie spital"],
    response: "Harta interactivă a spitalului este în Hartă Spital din meniu. Vezi cabinetul și etajul fiecărui medic.",
    priority: 7,
    roles: ["patient"],
  },
  {
    triggers: ["mesaje", "mesaj", "trimit mesaj", "scriu doctorului", "mesaj doctor", "conversație", "conversatie"],
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
    triggers: ["raportez", "raportare", "raportează", "raportez problemă", "raportez problema", "problemă", "problema", "reclamatie", "reclamație"],
    response: "Poți raporta o problemă (bug, sugestie) din meniu → Raportează o problemă. Raportul merge către administrator.",
    priority: 6,
    roles: ["patient"],
  },
  {
    triggers: ["faq", "întrebări frecvente", "intrebari frecvente", "ajutor aplicație", "ajutor aplicatie"],
    response: "Întrebările frecvente sunt pe pagina FAQ (link în header). Acolo găsești răspunsuri despre programări, analize, dosar medical.",
    priority: 6,
    roles: ["patient"],
  },
  {
    triggers: ["deconectare", "logout", "ieși", "iesi", "deconecteaz"],
    response: "Te deconectezi din butonul din header (dreapta).",
    priority: 5,
    roles: ["patient"],
  },
];

// ─── REGULI DOCTOR ──────────────────────────────────────────
const DOCTOR_RULES: ChatRule[] = [
  {
    triggers: ["ajutor", "help", "ajut", "ce pot face", "cum funcționează", "cum functioneaza", "ce oferă", "ce ofera"],
    response: "Ca medic poți: programări (Dashboard), calendar, istoric pacienți, consultații și rapoarte (consultații / rapoarte), rețete emise, imagistică (investigații ordonate), mesaje, profil. Scrie un subiect.",
    priority: 5,
    roles: ["doctor"],
  },
  {
    triggers: ["programare", "programări", "programari", "programările mele", "programarile mele", "ce programări am", "câte programări", "cate programari", "dashboard"],
    response: "Programările tale sunt pe pagina principală (Dashboard). Vezi confirmări, în așteptare, anulate și poți adăuga/edita consultații.",
    dynamicIntent: "doctor_appointments",
    priority: 9,
    roles: ["doctor"],
  },
  {
    triggers: ["calendar", "calendar programări", "ce am săptămâna", "ce am saptamana", "programări pe zi"],
    response: "Calendarul cu programările tale este în meniu → Calendar.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["pacienți", "pacienti", "pacienții mei", "pacientii mei", "câți pacienți", "cati pacienti", "lista pacienți", "lista pacienti", "istoric pacienți", "istoric pacienti"],
    response: "Lista pacienților tăi este la Istoric pacienți din meniu. Apasă pe un pacient pentru detalii complete.",
    dynamicIntent: "doctor_patients",
    priority: 9,
    roles: ["doctor"],
  },
  {
    triggers: ["detalii pacient", "dosar pacient", "fișă pacient", "fisa pacient", "alergii pacient", "istoric pacient", "date pacient", "vezi pacient"],
    response: "Detaliile complete ale pacientului (contact, alergii, rețete, vaccinări, analize, istoric familial, consultații) sunt în Istoric pacienți → apasă pe numele pacientului.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["contact pacient", "sună pacient", "suna pacient", "telefon pacient", "email pacient", "contactez pacient"],
    response: "Datele de contact (telefon, email) și butoanele Sună/Email sunt în ficha pacientului: Istoric pacienți → click pe pacient.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["rezultate analize", "analize pacient", "completez analize", "rezultate laborator", "rezultate analize pacient"],
    response: "Dacă ești medic de analize: pe Dashboard la programarea respectivă apare butonul pentru completare rezultate. Pentru alți medici: rezultatele analizelor pacienților le vezi în ficha pacientului (Istoric pacienți → pacient → secțiunea Analize).",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["mesaje", "mesaj", "mesaje pacienți", "mesaje pacienti", "mesaje noi", "mesaje necitite", "am mesaje", "conversație", "conversatie", "scriu pacient"],
    response: "Mesajele sunt în Mesaje din meniu (legate de programări). Din ficha unui pacient poți deschide direct conversația pentru programarea următoare.",
    dynamicIntent: "doctor_messages",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["consultație", "consultatie", "adaug consultație", "adaug consultatie", "consultație nouă", "consultatie noua", "cum adaug consultație", "consultații", "consultatii", "notă medicală", "nota medicala", "unde completez consultația"],
    response: "Consultațiile se adaugă din Dashboard: la fiecare programare (card) apasă butonul Adaugă/Editează Consultație. Completezi motivul, semne vitale, diagnostice, rețete. Rapoarte PDF din Consultații / Rapoarte.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["anulez programare", "anulare programare", "anulare", "cancel programare"],
    response: "Pe Dashboard, la fiecare programare există butonul Anulare. Confirmi și programarea este anulată.",
    priority: 7,
    roles: ["doctor"],
  },
  {
    triggers: ["videoconferință", "videoconferinta", "video", "programare video", "apel video", "consult video"],
    response: "La programările de tip videoconferință, pe cardul din Dashboard apare butonul Videoconferință care deschide apelul. Poți accesa și din Mesaje.",
    priority: 7,
    roles: ["doctor"],
  },
  {
    triggers: ["ordon investigație", "ordon investigatie", "cerere imagistică", "cerere imagistica", "rezerv slot imagistică", "programez RMN", "programez CT"],
    response: "Din Imagistică din meniu: completezi formularul (pacient, modalitate RMN/CT/ecografie etc., dată, slot). Rezervarea apare în lista ta de cereri imagistică.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["semne vitale", "tensiune", "puls", "greutate", "temperatură", "temperatura", "unde completez semne vitale"],
    response: "Semnele vitale se completează în formularul de consultație (Adaugă consultație pe Dashboard). Poți adăuga și din ficha pacientului dacă există formular dedicat.",
    priority: 7,
    roles: ["doctor"],
  },
  {
    triggers: ["raport", "rapoarte", "raport medical", "pdf consultație", "pdf consultatie", "descarc raport", "consultații rapoarte"],
    response: "Rapoarte medicale (PDF) per consultație se generează din Consultații / Rapoarte din meniu. Acolo vezi toate consultațiile și butonul de descărcare PDF.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["rețetă", "reteta", "rețete", "retete", "prescriu", "prescrie", "medicamente", "medicament", "tratament", "rețete emise", "retete emise"],
    response: "Rețetele se adaugă din formularul de consultație (pas 3). Lista rețetelor emise de tine este în Rețete emise din meniu.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["imagistică", "imagistica", "investigații", "investigatii", "RMN", "CT", "ecografie", "radiografie", "programări imagistică", "ordonanță imagistică"],
    response: "Investigațiile imagistice (programări RMN, CT etc.) se gestionează din Imagistică din meniu. Poți vedea ce ai ordonat și statusul.",
    priority: 8,
    roles: ["doctor"],
  },
  {
    triggers: ["profil", "profilul meu", "date medic", "datele mele", "specializare"],
    response: "Profilul tău de medic (nume, specializare) este accesibil din click pe numele tău din bara de sus → Profil.",
    dynamicIntent: "doctor_profile",
    priority: 7,
    roles: ["doctor"],
  },
  {
    triggers: ["statistici", "statistică", "statistica", "câte programări confirmate", "cate programari confirmate", "în așteptare", "in asteptare", "anulate", "rezumat"],
    response: "Statisticile (confirmate, în așteptare, anulate, pacienți unici) le vezi pe Dashboard.",
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
    response: "Te deconectezi din butonul Deconectare din bara de sus, dreapta.",
    priority: 5,
    roles: ["doctor"],
  },
];

// ─── REGULI ADMIN ───────────────────────────────────────────
const ADMIN_RULES: ChatRule[] = [
  {
    triggers: ["ajutor", "help", "ajut", "ce pot face", "cum funcționează", "cum functioneaza", "ce oferă", "ce ofera"],
    response: "Ca administrator poți: programări, pacienți, urgențe, medici de gardă (și plată gărzi 350 lei), spitalizări, medicamente, imagistică, import analize, rapoarte (grafice, export PDF/CSV), raportări probleme, logistică (consumabile, transport intern). Scrie un subiect.",
    priority: 5,
    roles: ["admin"],
  },
  {
    triggers: ["programare", "programări", "programari", "câte programări", "cate programari", "programări totale", "programari totale", "toate programările", "toate programarile"],
    response: "Toate programările sunt pe Dashboard și în secțiunea Programări. Poți filtra pe specializare și medic.",
    dynamicIntent: "admin_appointments",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["pacienți", "pacienti", "câți pacienți", "cati pacienti", "total pacienți", "total pacienti", "lista pacienți", "lista pacienti", "înregistrați", "inregistrati"],
    response: "Lista pacienților este în Pacienți din meniu. Vezi date complete și istoric.",
    dynamicIntent: "admin_patients",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["urgențe", "urgente", "urgență", "urgenta", "cazuri urgență", "cazuri urgenta", "caz urgență", "caz urgenta", "UPU", "triaj"],
    response: "Cazurile de urgență se gestionează în Urgențe: triaj, asignare medic, evoluție. Poți adăuga caz nou.",
    dynamicIntent: "admin_emergencies",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["ATI", "ati", "terapie intensivă", "terapie intensiva", "paturi ATI", "locuri ATI", "locuri ati", "intensiv"],
    response: "ATI: paturi, pacienți critici, echipamente. Detalii în secțiunea dedicată.",
    dynamicIntent: "admin_icu",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["internare", "internări", "internari", "spitalizări", "spitalizari", "pacienți internați", "pacienti internati", "admisii", "externare", "internări active"],
    response: "Internările (spitalizări) sunt în Spitalizări: camere, secții, doctor responsabil, data externării.",
    dynamicIntent: "admin_admissions",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["medicamente", "medicament", "stoc", "stocuri", "medicamente stoc", "farmacie", "reaprovizionare", "stoc minim", "alerte stoc"],
    response: "Stocurile de medicamente sunt în Medicamente. Vezi alerte pentru stoc sub minim.",
    dynamicIntent: "admin_medications",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["echipament", "echipamente", "aparatură", "aparatura", "dispozitiv", "dispozitive"],
    response: "Echipamentele sunt în secțiunea Echipamente (dacă este activă).",
    dynamicIntent: "admin_equipment",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["transport", "ambulanță", "ambulanta", "ambulanțe", "ambulante", "misiuni", "misiune", "dispecerat"],
    response: "Ambulanțele și misiunile sunt în secțiunea Transport/Ambulanțe.",
    dynamicIntent: "admin_transport",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["gardă", "garda", "medici de gardă", "medici de garda", "cine e de gardă", "cine e de garda", "programare gardă"],
    response: "Medicii de gardă se configurează din Urgențe → Medici de gardă. Poți vedea cine e de gardă și perioadele.",
    dynamicIntent: "admin_on_duty",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["plată gărzi", "plata gardi", "plăți gărzi", "plati gardi", "contribuție medici", "contributie medici", "350 lei", "gărzi plătite", "gardi platite", "raport gărzi", "raport gardi", "cât se plătește garda", "cat se plateste garda"],
    response: "Gărzi sunt plătite 350 lei/gardă. Raportul cu număr gărzi per medic și contribuția lunară este în Rapoarte → secțiunea Contribuție gărzi (și în export PDF/CSV).",
    dynamicIntent: "admin_guard_payments",
    priority: 9,
    roles: ["admin"],
  },
  {
    triggers: ["rapoarte", "raport", "grafice", "export pdf", "export csv", "raport programări", "raport urgențe", "dashboard rapoarte"],
    response: "Rapoarte cu grafice (programări, urgențe, imagistică, gărzi) și export PDF/CSV sunt în Rapoarte din meniu. Poți alege perioada 7/30/90 zile.",
    dynamicIntent: "admin_reports_dashboard",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["probleme raportate", "probleme", "reclamații", "reclamatii", "raportări probleme", "raportari probleme", "tickete", "suport"],
    response: "Raportările de probleme de la pacienți sunt în Raportări probleme. Poți actualiza statusul și nota administrator.",
    dynamicIntent: "admin_reports",
    priority: 7,
    roles: ["admin"],
  },
  {
    triggers: ["imagistică", "imagistica", "investigații", "investigatii", "RMN", "CT", "ecografie", "radiografie", "programări imagistică"],
    response: "Imagistica: programări investigații (RMN, CT etc.), status și rezultate. Secțiunea Imagistică din meniu.",
    dynamicIntent: "admin_imaging",
    priority: 7,
    roles: ["admin"],
  },
  {
    triggers: ["import analize", "import rezultate", "analize csv", "analize excel", "încarc analize", "incarc analize", "lab", "laborator"],
    response: "Importul de rezultate analize (CSV/Excel) se face din Import analize. Verifici asistența pacientului și maparea coloanelor.",
    dynamicIntent: "admin_lab_import",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["consumabile", "cereri consumabile", "consumabil", "cereri secții", "cereri sectii"],
    response: "Cererile de consumabile (pe secții) sunt în Logistică. Vezi cereri în așteptare și le poți aproba/onora.",
    dynamicIntent: "admin_logistics",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["transport intern", "transport pacienți", "transport pacienti", "cereri transport", "scaun cu rotile", "targă", "targa"],
    response: "Cererile de transport intern (pacienți între secții) sunt în Logistică → transport. Tipuri: scaun cu rotile, targă, pat.",
    dynamicIntent: "admin_logistics",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["logistică", "logistica", "logistic"],
    response: "Logistica include: cereri consumabile (secții) și cereri transport intern. Totul în secțiunea Logistică.",
    dynamicIntent: "admin_logistics",
    priority: 8,
    roles: ["admin"],
  },
  {
    triggers: ["statistici", "statistică", "statistica", "overview", "rezumat", "sumar", "dashboard", "panou"],
    response: "Dashboard-ul administrator arată KPI-uri și rezumat din fiecare modul: programări, urgențe, pacienți, raportări, logistică.",
    dynamicIntent: "admin_stats",
    priority: 7,
    roles: ["admin"],
  },
  {
    triggers: ["deconectare", "logout", "ieși", "iesi", "deconecteaz", "delog"],
    response: "Te deconectezi din butonul Deconectare din header, dreapta.",
    priority: 5,
    roles: ["admin"],
  },
];

// Combină toate regulile
const ALL_RULES = [...COMMON_RULES, ...PATIENT_RULES, ...DOCTOR_RULES, ...ADMIN_RULES];

const DEFAULT_RESPONSES: Record<string, string> = {
  patient: "Nu am înțeles exact. Poți întreba despre: programare nouă, programări, anulare, reprogramare, istoric medical, rețete, analize, calendar, profil, alergii, vaccinări, hartă spital, mesaje, raportare problemă, notificări, PDF/raport consultație sau FAQ.",
  doctor: "Nu am înțeles exact. Poți întreba despre: programări, calendar, pacienți (detalii, contact), consultații, rapoarte PDF, rețete emise, imagistică (ordonare), rezultate analize, videoconferință, anulare programare, mesaje, profil sau statistici.",
  admin: "Nu am înțeles exact. Poți întreba despre: programări, pacienți, urgențe, medici de gardă, plată gărzi, spitalizări, medicamente, imagistică, import analize, rapoarte, raportări probleme, logistică sau statistici.",
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
