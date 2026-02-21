export type RoomCategory =
  | "reception" | "emergency" | "imaging" | "lab" | "consultation"
  | "icu" | "pharmacy" | "cafeteria" | "restroom" | "elevator"
  | "stairs" | "ward" | "utility" | "waiting" | "nurses" | "office";

export type Room = {
  id: string;
  roomNumber: string;
  name: string;
  category: RoomCategory;
  floor: number;
  x: number;
  y: number;
  w: number;
  h: number;
  doctor?: string;
  specialty?: string;
  description: string;
  hours?: string;
  phone?: string;
  doorSide?: "top" | "bottom" | "left" | "right";
};

export type Corridor = { x: number; y: number; w: number; h: number; label?: string };
export type FloorPlan = { number: number; name: string; label: string; rooms: Room[]; corridors: Corridor[] };

// === CLĂDIRE DREPTUNGHIULARĂ — DOUBLE-LOADED CORRIDOR ===
//
//  ┌──────────────────────────────────────────────┐
//  │ [Cam] [Cam] [Cam] [Cam] [Cam] [Cam] [Cam]   │  ← rând SUS, ușă ↓ spre coridor
//  │                                              │
//  │ ══════════ CORIDOR PRINCIPAL ════════════════ │
//  │                                              │
//  │ [Cam] [Cam] [Cam] [Cam] [Cam] [Cam] [Cam]   │  ← rând JOS, ușă ↑ spre coridor
//  │                                              │
//  │ ────────── coridor secundar ──────────────── │
//  │ [L1] [L2] [Scări] [WC]  [util] [util] [util]│  ← utilități
//  └──────────────────────────────────────────────┘

const BW = 800;
const BH = 500;

const MARGIN = 28;
const ROOM_W = 100;
const ROOM_H = 115;
const GAP = 6;
const COLS = 7;
const START_X = MARGIN + 2;

const TOP_Y = 36;
const CORRIDOR_Y = TOP_Y + ROOM_H + 4;
const CORRIDOR_H = 44;
const BOT_Y = CORRIDOR_Y + CORRIDOR_H + 4;
const UTIL_CORRIDOR_Y = BOT_Y + ROOM_H + 4;
const UTIL_CORRIDOR_H = 20;
const UTIL_Y = UTIL_CORRIDOR_Y + UTIL_CORRIDOR_H + 4;
const UTIL_H = BH - UTIL_Y - MARGIN;

function col(c: number): number { return START_X + c * (ROOM_W + GAP); }

function rm(
  id: string, num: string, name: string, cat: RoomCategory, fl: number,
  c: number, row: "top" | "bot" | "util", desc: string,
  o?: { doctor?: string; specialty?: string; hours?: string; phone?: string; w?: number }
): Room {
  const x = col(c);
  const y = row === "top" ? TOP_Y : row === "bot" ? BOT_Y : UTIL_Y;
  const h = row === "util" ? UTIL_H : ROOM_H;
  const w = o?.w ?? ROOM_W;
  const doorSide = row === "top" ? "bottom" as const : "top" as const;
  return { id, roomNumber: num, name, category: cat, floor: fl, x, y, w, h, description: desc, doorSide, doctor: o?.doctor, specialty: o?.specialty, hours: o?.hours, phone: o?.phone };
}

function floorCorridors(): Corridor[] {
  return [
    { x: START_X, y: CORRIDOR_Y, w: COLS * (ROOM_W + GAP) - GAP, h: CORRIDOR_H, label: "CORIDOR PRINCIPAL" },
    { x: START_X, y: UTIL_CORRIDOR_Y, w: COLS * (ROOM_W + GAP) - GAP, h: UTIL_CORRIDOR_H },
  ];
}

// ── PARTER ──
const FLOOR_0: FloorPlan = {
  number: 0, name: "Parter", label: "Recepție, Urgențe, Farmacie, Cafeteria",
  rooms: [
    rm("p01", "P01", "Recepție", "reception", 0, 0, "top", "Recepția principală. Informații, programări.", { hours: "L-V: 07:00-20:00", phone: "ext. 100" }),
    rm("p02", "P02", "Sală așteptare", "waiting", 0, 1, "top", "Sală așteptare principală. WiFi, TV."),
    rm("p03", "P03", "Farmacie", "pharmacy", 0, 2, "top", "Farmacie internă. Rețete, OTC.", { hours: "L-V: 08:00-20:00", phone: "ext. 201" }),
    rm("p04", "P04", "Birou Admin", "office", 0, 3, "top", "Birou administrativ.", { hours: "L-V: 08:00-16:00" }),
    rm("p05", "P05", "Pază", "utility", 0, 4, "top", "Securitate. Monitorizare video. 24/7."),
    rm("p06", "P06", "Cafeteria", "cafeteria", 0, 5, "top", "Cafeteria. Meniu zilnic, cafea.", { hours: "L-D: 07:00-20:00" }),
    rm("p07", "P07", "Sala Consiliu", "office", 0, 6, "top", "Sala ședințe / consiliu."),
    rm("u01", "U01", "Triaj Urgențe", "emergency", 0, 0, "bot", "Triaj urgențe. Evaluare inițială.", { doctor: "Medic gardă", hours: "24/7", phone: "ext. 111" }),
    rm("u02", "U02", "Urgențe 1", "emergency", 0, 1, "bot", "Sală examinare urgențe.", { hours: "24/7" }),
    rm("u03", "U03", "Urgențe 2", "emergency", 0, 2, "bot", "Sală tratament urgențe.", { hours: "24/7" }),
    rm("u04", "U04", "Observație", "emergency", 0, 3, "bot", "Observație scurtă (max 24h).", { hours: "24/7" }),
    rm("u05", "U05", "Așteptare Urg", "waiting", 0, 4, "bot", "Așteptare aparținători urgențe."),
    rm("u06", "U06", "Ambulanțe", "emergency", 0, 5, "bot", "Rampă acces ambulanțe. 24/7.", { hours: "24/7" }),
    rm("u07", "U07", "Cameră Tehnică", "utility", 0, 6, "bot", "Echipamente tehnice, electricitate."),
    rm("p-l1", "L1", "Lift 1", "elevator", 0, 0, "util", "Lift principal. Toate etajele."),
    rm("p-l2", "L2", "Lift 2", "elevator", 0, 1, "util", "Lift secundar. Toate etajele."),
    rm("p-sc", "SC", "Scări", "stairs", 0, 2, "util", "Casa scărilor. Toate etajele."),
    rm("p-wc", "WC", "Toalete", "restroom", 0, 3, "util", "Toalete publice."),
    rm("p08", "P08", "Depozit", "utility", 0, 4, "util", "Depozit materiale medicale."),
    rm("p09", "P09", "IT / Helpdesk", "utility", 0, 5, "util", "Suport tehnic IT."),
    rm("p10", "P10", "Arhivă", "utility", 0, 6, "util", "Arhivă documente."),
  ],
  corridors: floorCorridors(),
};

// ── ETAJ 1 — Consultații ──
const FLOOR_1: FloorPlan = {
  number: 1, name: "Etaj 1 — Consultații", label: "Cabinete medicale cu doctor asignat",
  rooms: [
    rm("c101", "C101", "Cardiologie", "consultation", 1, 0, "top", "Cabinet cardiologie. EKG, ecocardiografie.", { doctor: "Dr. Ion Popescu", specialty: "Cardiologie", hours: "L-V: 10:00-18:00", phone: "ext. 101" }),
    rm("c102", "C102", "Dermatologie", "consultation", 1, 1, "top", "Cabinet dermatologie. Dermatoscopie.", { doctor: "Dr. Maria Ionescu", specialty: "Dermatologie", hours: "L-V: 10:00-18:00", phone: "ext. 102" }),
    rm("c103", "C103", "Endocrinologie", "consultation", 1, 2, "top", "Cabinet endocrinologie. Diabet, tiroidă.", { doctor: "Dr. Alexandru Georgescu", specialty: "Endocrinologie", hours: "L-V: 10:00-18:00", phone: "ext. 103" }),
    rm("c104", "C104", "Gastro", "consultation", 1, 3, "top", "Cabinet gastroenterologie.", { doctor: "Dr. Elena Radu", specialty: "Gastroenterologie", hours: "L-V: 10:00-18:00", phone: "ext. 104" }),
    rm("c105", "C105", "Neurologie", "consultation", 1, 4, "top", "Cabinet neurologie. EEG.", { doctor: "Dr. Andrei Stanciu", specialty: "Neurologie", hours: "L-V: 10:00-18:00", phone: "ext. 105" }),
    rm("c106", "C106", "Oftalmologie", "consultation", 1, 5, "top", "Cabinet oftalmologie.", { doctor: "Dr. Cristina Moldovan", specialty: "Oftalmologie", hours: "L-V: 10:00-18:00", phone: "ext. 106" }),
    rm("c107", "C107", "Ortopedie", "consultation", 1, 6, "top", "Cabinet ortopedie.", { doctor: "Dr. Florin Dumitrescu", specialty: "Ortopedie", hours: "L-V: 10:00-18:00", phone: "ext. 107" }),
    rm("c108", "C108", "Pediatrie", "consultation", 1, 0, "bot", "Cabinet pediatrie.", { doctor: "Dr. Ana-Maria Constantinescu", specialty: "Pediatrie", hours: "L-V: 10:00-18:00", phone: "ext. 108" }),
    rm("c109", "C109", "Psihiatrie", "consultation", 1, 1, "bot", "Cabinet psihiatrie.", { doctor: "Dr. Bogdan Nistor", specialty: "Psihiatrie", hours: "L-V: 10:00-18:00", phone: "ext. 109" }),
    rm("c110", "C110", "Urologie", "consultation", 1, 2, "bot", "Cabinet urologie.", { doctor: "Dr. Ioana Petrescu", specialty: "Urologie", hours: "L-V: 10:00-18:00", phone: "ext. 110" }),
    rm("c111", "C111", "Chirurgie 1", "consultation", 1, 3, "bot", "Cabinet chirurgie generală.", { doctor: "Dr. Victor Marinescu", specialty: "Chirurgie", hours: "L-V: 10:00-18:00", phone: "ext. 111" }),
    rm("c112", "C112", "Chirurgie 2", "consultation", 1, 4, "bot", "Cabinet chirurgie.", { doctor: "Dr. Raluca Enache", specialty: "Chirurgie", hours: "L-V: 10:00-18:00", phone: "ext. 112" }),
    rm("c113", "C113", "Analize", "consultation", 1, 5, "bot", "Cabinet analize medicale.", { doctor: "Dr. Laura Popa", specialty: "Analize medicale", hours: "L-V: 10:00-18:00", phone: "ext. 113" }),
    rm("1-pm", "PM", "Post Asistente", "nurses", 1, 6, "bot", "Post medical. Triaj consultații.", { hours: "L-V: 08:00-20:00" }),
    rm("1-l1", "L1", "Lift 1", "elevator", 1, 0, "util", "Lift. Toate etajele."),
    rm("1-l2", "L2", "Lift 2", "elevator", 1, 1, "util", "Lift. Toate etajele."),
    rm("1-sc", "SC", "Scări", "stairs", 1, 2, "util", "Scări. Toate etajele."),
    rm("1-wc", "WC", "Toalete", "restroom", 1, 3, "util", "Toalete publice."),
    rm("1-wait", "A1", "Așteptare", "waiting", 1, 4, "util", "Sală așteptare. WiFi."),
    rm("1-arch", "AR", "Arhivă", "utility", 1, 5, "util", "Arhivă dosare medicale."),
    rm("1-office", "B1", "Birou Secție", "office", 1, 6, "util", "Birou secție consultații."),
  ],
  corridors: floorCorridors(),
};

// ── ETAJ 2 — Consultații B (cabinete suplimentare pentru toți doctorii) ──
const FLOOR_2_CONSULT: FloorPlan = {
  number: 2, name: "Etaj 2 — Consultații B", label: "Cabinete medicale suplimentare",
  rooms: [
    rm("c201", "C201", "Cardiologie 2", "consultation", 2, 0, "top", "Cabinet cardiologie. Electrofiziologie, aritmii.", { doctor: "Dr. Radu Vasilescu", specialty: "Cardiologie", hours: "L-V: 10:00-18:00", phone: "ext. 201" }),
    rm("c202", "C202", "Cardiologie 3", "consultation", 2, 1, "top", "Cabinet insuficiență cardiacă, ecocardiografie.", { doctor: "Dr. Mihai Tănase", specialty: "Cardiologie", hours: "L-V: 10:00-18:00", phone: "ext. 202" }),
    rm("c203", "C203", "Dermatologie 2", "consultation", 2, 2, "top", "Cabinet dermatologie. Dermatologie pediatrică.", { doctor: "Dr. Simona Marin", specialty: "Dermatologie", hours: "L-V: 10:00-18:00", phone: "ext. 203" }),
    rm("c204", "C204", "Endocrinologie 2", "consultation", 2, 3, "top", "Cabinet endocrinologie. Boli metabolice, tiroidă.", { doctor: "Dr. Cătălin Olteanu", specialty: "Endocrinologie", hours: "L-V: 10:00-18:00", phone: "ext. 204" }),
    rm("c205", "C205", "Gastro 2", "consultation", 2, 4, "top", "Cabinet gastroenterologie. Hepatologie.", { doctor: "Dr. Diana Gheorghe", specialty: "Gastroenterologie", hours: "L-V: 10:00-18:00", phone: "ext. 205" }),
    rm("c206", "C206", "Neurologie 2", "consultation", 2, 5, "top", "Cabinet neurologie. Scleroză multiplă, neuroimunologie.", { doctor: "Dr. Adrian Stoica", specialty: "Neurologie", hours: "L-V: 10:00-18:00", phone: "ext. 206" }),
    rm("c207", "C207", "Chirurgie Toracică", "consultation", 2, 6, "top", "Cabinet chirurgie toracică și pulmonară.", { doctor: "Dr. Gabriel Ionescu", specialty: "Chirurgie", hours: "L-V: 10:00-18:00", phone: "ext. 207" }),
    rm("c208", "C208", "Chirurgie Plastică", "consultation", 2, 0, "bot", "Cabinet chirurgie plastică și reconstructivă.", { doctor: "Dr. Andreea Stoica", specialty: "Chirurgie", hours: "L-V: 10:00-18:00", phone: "ext. 208" }),
    rm("2-pm", "PM2", "Post Asistente", "nurses", 2, 1, "bot", "Post medical. Triaj consultații B.", { hours: "L-V: 08:00-20:00" }),
    rm("2-wait", "A2", "Așteptare", "waiting", 2, 2, "bot", "Sală așteptare. WiFi."),
    rm("2-arch", "AR2", "Arhivă", "utility", 2, 3, "bot", "Arhivă dosare medicale."),
    rm("2-office", "B2", "Birou Secție", "office", 2, 4, "bot", "Birou secție consultații B."),
    rm("2-dep", "D2", "Depozit", "utility", 2, 5, "bot", "Depozit materiale."),
    rm("2-extra", "C209", "Cabinet Vizită", "consultation", 2, 6, "bot", "Cabinet vizite și consultații ocazionale.", { hours: "L-V: 09:00-17:00" }),
    rm("2-l1", "L1", "Lift 1", "elevator", 2, 0, "util", "Lift. Toate etajele."),
    rm("2-l2", "L2", "Lift 2", "elevator", 2, 1, "util", "Lift. Toate etajele."),
    rm("2-sc", "SC", "Scări", "stairs", 2, 2, "util", "Scări. Toate etajele."),
    rm("2-wc", "WC", "Toalete", "restroom", 2, 3, "util", "Toalete publice."),
    rm("2-wait2", "A2-2", "Așteptare 2", "waiting", 2, 4, "util", "Așteptare suplimentară."),
    rm("2-arch2", "AR2-2", "Arhivă 2", "utility", 2, 5, "util", "Arhivă."),
    rm("2-office2", "B2-2", "Birou", "office", 2, 6, "util", "Birou."),
  ],
  corridors: floorCorridors(),
};

// ── ETAJ 3 — Imagistică ──
const FLOOR_3: FloorPlan = {
  number: 3, name: "Etaj 3 — Imagistică", label: "RMN, CT, Ecografie, Radiologie, Mamografie",
  rooms: [
    rm("i01", "I01", "RMN", "imaging", 3, 0, "top", "Rezonanță magnetică 3T. ~45 min.", { hours: "L-V: 08:00-18:00", phone: "ext. 301" }),
    rm("i01c", "I01-C", "Control RMN", "utility", 3, 1, "top", "Cameră comandă RMN. Acces restricționat."),
    rm("i02", "I02", "CT", "imaging", 3, 2, "top", "Tomografie computerizată 128 slice. ~30 min.", { hours: "L-V: 08:00-18:00", phone: "ext. 302" }),
    rm("i02c", "I02-C", "Control CT", "utility", 3, 3, "top", "Cameră comandă CT."),
    rm("i03", "I03", "Ecografie 1", "imaging", 3, 4, "top", "Ecografie cardio/abdominală.", { doctor: "Dr. Carmen Dumitrescu", hours: "L-V: 08:00-18:00", phone: "ext. 303" }),
    rm("i04", "I04", "Ecografie 2", "imaging", 3, 5, "top", "Ecografie generală.", { hours: "L-V: 08:00-18:00", phone: "ext. 304" }),
    rm("i-vest", "V", "Vestiar", "utility", 3, 6, "top", "Vestiar pacienți imagistică."),
    rm("i05", "I05", "Radiologie", "imaging", 3, 0, "bot", "Radiografie digitală. Rezultate imediat.", { hours: "L-V: 08:00-18:00", phone: "ext. 305" }),
    rm("i06", "I06", "Mamografie", "imaging", 3, 1, "bot", "Mamografie digitală cu tomosinteză.", { hours: "L-V: 08:00-18:00", phone: "ext. 306" }),
    rm("i-pacs", "PACS", "Server PACS", "utility", 3, 2, "bot", "Servere imagini. Acces restricționat."),
    rm("i-read", "I08", "Sala Lectură", "office", 3, 3, "bot", "Sala lectură/interpretare imagini."),
    rm("i-res", "I07", "Rezultate", "office", 3, 4, "bot", "Eliberare rezultate imagistice.", { hours: "L-V: 10:00-18:00" }),
    rm("i-wait", "A3", "Așteptare", "waiting", 3, 5, "bot", "Sală așteptare imagistică."),
    rm("i-dep", "D3", "Depozit", "utility", 3, 6, "bot", "Depozit consumabile imagistică."),
    rm("3-l1", "L1", "Lift 1", "elevator", 3, 0, "util", "Lift. Toate etajele."),
    rm("3-l2", "L2", "Lift 2", "elevator", 3, 1, "util", "Lift. Toate etajele."),
    rm("3-sc", "SC", "Scări", "stairs", 3, 2, "util", "Scări. Toate etajele."),
    rm("3-wc", "WC", "Toalete", "restroom", 3, 3, "util", "Toalete publice."),
    rm("3-wait2", "A3-2", "Așteptare 2", "waiting", 3, 4, "util", "Sală așteptare suplimentară."),
    rm("3-office", "B3", "Birou Secție", "office", 3, 5, "util", "Birou secție imagistică."),
    rm("3-equip", "EQ3", "Echipamente", "utility", 3, 6, "util", "Depozit echipamente."),
  ],
  corridors: floorCorridors(),
};

// ── ETAJ 4 — Laborator ──
const FLOOR_4: FloorPlan = {
  number: 4, name: "Etaj 4 — Laborator", label: "Recoltare, procesare, eliberare rezultate",
  rooms: [
    rm("l01", "L01", "Recoltare 1", "lab", 4, 0, "top", "Recoltare sânge. A jeun dimineața.", { hours: "L-V: 07:00-14:00", phone: "ext. 401" }),
    rm("l02", "L02", "Recoltare 2", "lab", 4, 1, "top", "Recoltare sânge suplimentar.", { hours: "L-V: 07:00-14:00", phone: "ext. 402" }),
    rm("l03", "L03", "Recoltare Probe", "lab", 4, 2, "top", "Urină, probe biologice.", { hours: "L-V: 07:00-14:00", phone: "ext. 403" }),
    rm("l04", "L04", "Hematologie", "lab", 4, 3, "top", "Analize hematologice."),
    rm("l05", "L05", "Biochimie", "lab", 4, 4, "top", "Analize biochimice."),
    rm("l06", "L06", "Imunologie", "lab", 4, 5, "top", "Serologii, markeri imunologici."),
    rm("l07", "L07", "Coagulare", "lab", 4, 6, "top", "Coagulare, INR, fibrinogen."),
    rm("l08", "L08", "Procesare", "lab", 4, 0, "bot", "Procesare probe. Acces restricționat."),
    rm("l09", "L09", "Microbiologie", "lab", 4, 1, "bot", "Culturi bacteriene, antibiograme."),
    rm("l10", "L10", "Eliberare", "office", 4, 2, "bot", "Ridicare rezultate. Și online.", { hours: "L-V: 08:00-18:00", phone: "ext. 404" }),
    rm("l11", "L11", "Birou Șef Lab", "office", 4, 3, "bot", "Birou medic șef laborator.", { hours: "L-V: 08:00-16:00" }),
    rm("l12", "L12", "Depozit Reactivi", "utility", 4, 4, "bot", "Depozit reactivi și consumabile."),
    rm("l13", "L13", "Cameră Rece", "utility", 4, 5, "bot", "Depozit probe temperatură scăzută."),
    rm("l-wait", "A4", "Așteptare", "waiting", 4, 6, "bot", "Sală așteptare laborator."),
    rm("4-l1", "L1", "Lift 1", "elevator", 4, 0, "util", "Lift. Toate etajele."),
    rm("4-l2", "L2", "Lift 2", "elevator", 4, 1, "util", "Lift. Toate etajele."),
    rm("4-sc", "SC", "Scări", "stairs", 4, 2, "util", "Scări. Toate etajele."),
    rm("4-wc", "WC", "Toalete", "restroom", 4, 3, "util", "Toalete publice."),
    rm("4-wait2", "A4-2", "Așteptare 2", "waiting", 4, 4, "util", "Așteptare suplimentară."),
    rm("4-arch", "AR4", "Arhivă Probe", "utility", 4, 5, "util", "Arhivă probe biologice."),
    rm("4-office", "B4", "Birou Secție", "office", 4, 6, "util", "Birou secție laborator."),
  ],
  corridors: floorCorridors(),
};

// ── ETAJ 5 — Spitalizare ──
const FLOOR_5: FloorPlan = {
  number: 5, name: "Etaj 5 — Spitalizare", label: "Saloane, post medical, tratamente",
  rooms: [
    rm("s401", "S401", "Salon 401 (2p)", "ward", 5, 0, "top", "Salon 2 paturi. Baie proprie, TV, WiFi.", { hours: "Vizite: 14:00-19:00" }),
    rm("s402", "S402", "Salon 402 (2p)", "ward", 5, 1, "top", "Salon 2 paturi. Baie proprie, TV, WiFi.", { hours: "Vizite: 14:00-19:00" }),
    rm("s403", "S403", "Salon 403 (4p)", "ward", 5, 2, "top", "Salon 4 paturi. Baie proprie, TV.", { hours: "Vizite: 14:00-19:00" }),
    rm("s404", "S404", "Salon 404 VIP", "ward", 5, 3, "top", "Salon 1 pat VIP. Mini-frigider.", { hours: "Vizite: 14:00-19:00" }),
    rm("s405", "S405", "Salon 405 (2p)", "ward", 5, 4, "top", "Salon 2 paturi.", { hours: "Vizite: 14:00-19:00" }),
    rm("s406", "S406", "Salon 406 (2p)", "ward", 5, 5, "top", "Salon 2 paturi.", { hours: "Vizite: 14:00-19:00" }),
    rm("s407", "S407", "Salon 407 (4p)", "ward", 5, 6, "top", "Salon 4 paturi.", { hours: "Vizite: 14:00-19:00" }),
    rm("s408", "S408", "Salon 408 (2p)", "ward", 5, 0, "bot", "Salon 2 paturi.", { hours: "Vizite: 14:00-19:00" }),
    rm("s409", "S409", "Salon 409 (2p)", "ward", 5, 1, "bot", "Salon 2 paturi.", { hours: "Vizite: 14:00-19:00" }),
    rm("s410", "S410", "Salon 410 (4p)", "ward", 5, 2, "bot", "Salon 4 paturi.", { hours: "Vizite: 14:00-19:00" }),
    rm("5-pm", "PM5", "Post Asistente", "nurses", 5, 3, "bot", "Post medical central. 24/7.", { phone: "ext. 400" }),
    rm("5-treat", "T501", "Tratamente", "ward", 5, 4, "bot", "Perfuzii, pansamente, proceduri.", { hours: "24/7" }),
    rm("5-office", "B501", "Birou Secție", "office", 5, 5, "bot", "Birou medic șef secție.", { doctor: "Dr. Lucian Munteanu", hours: "L-V: 08:00-16:00" }),
    rm("5-kitchen", "K5", "Oficiu Alimentar", "utility", 5, 6, "bot", "Distribuire mese pacienți.", { hours: "06:00-20:00" }),
    rm("5-l1", "L1", "Lift 1", "elevator", 5, 0, "util", "Lift. Toate etajele."),
    rm("5-l2", "L2", "Lift 2", "elevator", 5, 1, "util", "Lift. Toate etajele."),
    rm("5-sc", "SC", "Scări", "stairs", 5, 2, "util", "Scări. Toate etajele."),
    rm("5-wc", "WC", "Toalete", "restroom", 5, 3, "util", "Toalete vizitatori."),
    rm("5-wait", "A5", "Așteptare", "waiting", 5, 4, "util", "Așteptare vizitatori."),
    rm("5-linen", "RL5", "Depozit Rufe", "utility", 5, 5, "util", "Depozit lenjerie."),
    rm("5-equip", "EQ5", "Depozit Med", "utility", 5, 6, "util", "Depozit materiale medicale."),
  ],
  corridors: floorCorridors(),
};

// ── ETAJ 6 — ATI ──
const FLOOR_6: FloorPlan = {
  number: 6, name: "Etaj 6 — ATI", label: "Terapie intensivă, acces restricționat",
  rooms: [
    rm("ati1", "ATI-1", "Pat ATI 1", "icu", 6, 0, "top", "Pat terapie intensivă. Monitorizare continuă.", { hours: "24/7" }),
    rm("ati2", "ATI-2", "Pat ATI 2", "icu", 6, 1, "top", "Pat terapie intensivă.", { hours: "24/7" }),
    rm("ati3", "ATI-3", "Pat ATI 3", "icu", 6, 2, "top", "Pat terapie intensivă.", { hours: "24/7" }),
    rm("ati4", "ATI-4", "Pat ATI 4", "icu", 6, 3, "top", "Pat terapie intensivă.", { hours: "24/7" }),
    rm("ati5", "ATI-5", "ATI 5 Izolare", "icu", 6, 4, "top", "Cameră izolare. Presiune negativă.", { hours: "24/7" }),
    rm("ati6", "ATI-6", "ATI 6 Izolare", "icu", 6, 5, "top", "Cameră izolare.", { hours: "24/7" }),
    rm("ati-office", "B-ATI", "Birou Șef ATI", "office", 6, 6, "top", "Birou medic șef ATI.", { hours: "24/7", phone: "ext. 502" }),
    rm("ati7", "ATI-7", "Pat ATI 7", "icu", 6, 0, "bot", "Pat terapie intensivă.", { hours: "24/7" }),
    rm("ati8", "ATI-8", "Pat ATI 8", "icu", 6, 1, "bot", "Pat terapie intensivă.", { hours: "24/7" }),
    rm("ati-mon", "MON", "Monitorizare", "nurses", 6, 2, "bot", "Stație centrală monitorizare. 24/7.", { phone: "ext. 501" }),
    rm("ati-meds", "MED", "Medicamente ATI", "utility", 6, 3, "bot", "Depozit medicamente ATI."),
    rm("ati-equip", "EQ", "Echipamente", "utility", 6, 4, "bot", "Ventilatoare, monitoare."),
    rm("ati-sterile", "ST", "Sterilizare", "utility", 6, 5, "bot", "Pregătire materiale sterile."),
    rm("ati-wait", "A-ATI", "Așteptare Familii", "waiting", 6, 6, "bot", "Așteptare familii.", { hours: "Vizite: 15:00-16:00, 19:00-20:00" }),
    rm("6-l1", "L1", "Lift 1", "elevator", 6, 0, "util", "Lift. Toate etajele."),
    rm("6-l2", "L2", "Lift 2", "elevator", 6, 1, "util", "Lift. Toate etajele."),
    rm("6-sc", "SC", "Scări", "stairs", 6, 2, "util", "Scări. Toate etajele."),
    rm("6-wc", "WC", "Toalete", "restroom", 6, 3, "util", "Toalete personal / vizitatori."),
    rm("6-recovery", "REC", "Post-ATI", "ward", 6, 4, "util", "Salon trecere post-ATI."),
    rm("6-laundry", "RL6", "Depozit Rufe", "utility", 6, 5, "util", "Depozit lenjerie ATI."),
    rm("6-archive", "AR6", "Arhivă ATI", "utility", 6, 6, "util", "Arhivă fișe ATI."),
  ],
  corridors: floorCorridors(),
};

export const HOSPITAL_FLOORS: FloorPlan[] = [FLOOR_0, FLOOR_1, FLOOR_2_CONSULT, FLOOR_3, FLOOR_4, FLOOR_5, FLOOR_6];
export const BUILDING_DIMENSIONS = { w: BW, h: BH };

export function getAllRooms(): Room[] {
  return HOSPITAL_FLOORS.flatMap((f) => f.rooms);
}

export function searchRooms(query: string): Room[] {
  const q = query.toLowerCase();
  return getAllRooms().filter(
    (room) =>
      room.name.toLowerCase().includes(q) ||
      room.roomNumber.toLowerCase().includes(q) ||
      (room.doctor && room.doctor.toLowerCase().includes(q)) ||
      (room.specialty && room.specialty.toLowerCase().includes(q)) ||
      room.description.toLowerCase().includes(q)
  );
}

/** Normalizează numele doctorului pentru potrivire (fără "Dr.", trim, lowercase). */
function normalizeDoctorName(name: string): string {
  return name.replace(/^Dr\.?\s*/i, "").trim().toLowerCase();
}

/** Găsește cabinetul unde lucrează un doctor (potrivire după nume). Folosit pentru programări. */
export function getRoomByDoctor(doctorName: string): Room | null {
  if (!doctorName?.trim()) return null;
  const raw = doctorName.trim().toLowerCase();
  const withoutTitle = normalizeDoctorName(doctorName);
  return getAllRooms().find((room) => {
    if (!room.doctor) return false;
    const d = room.doctor.trim().toLowerCase();
    return d.includes(raw) || d.includes(withoutTitle) || raw.includes(normalizeDoctorName(room.doctor));
  }) ?? null;
}
