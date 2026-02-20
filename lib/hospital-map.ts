export type RoomCategory =
  | "reception"
  | "emergency"
  | "imaging"
  | "lab"
  | "consultation"
  | "icu"
  | "pharmacy"
  | "cafeteria"
  | "restroom"
  | "elevator"
  | "stairs"
  | "ward"
  | "utility"
  | "waiting"
  | "nurses"
  | "office";

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

export type Corridor = {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
};

export type FloorPlan = {
  number: number;
  name: string;
  label: string;
  rooms: Room[];
  corridors: Corridor[];
};

const BUILDING_W = 800;
const BUILDING_H = 500;

// Parter
const FLOOR_0: FloorPlan = {
  number: 0,
  name: "Parter",
  label: "Recepție, Urgențe, Farmacie, Cafeteria",
  rooms: [
    { id: "p-reception", roomNumber: "P01", name: "Recepție", category: "reception", floor: 0, x: 30, y: 60, w: 160, h: 100, description: "Recepția principală a spitalului. Informații, programări, direcționare.", hours: "L-V: 07:00-20:00, S: 08:00-14:00", phone: "ext. 100", doorSide: "bottom" },
    { id: "p-admin", roomNumber: "P02", name: "Birou Administrativ", category: "office", floor: 0, x: 30, y: 170, w: 160, h: 80, description: "Biroul administrativ al spitalului.", hours: "L-V: 08:00-16:00", doorSide: "right" },
    { id: "p-guard", roomNumber: "P03", name: "Pază / Securitate", category: "utility", floor: 0, x: 30, y: 260, w: 80, h: 60, description: "Post securitate. Monitorizare video, acces.", hours: "24/7", doorSide: "right" },
    { id: "p-waiting-main", roomNumber: "P04", name: "Sala de așteptare", category: "waiting", floor: 0, x: 200, y: 60, w: 160, h: 100, description: "Sală de așteptare principală. Scaune, WiFi gratuit, TV.", doorSide: "bottom" },
    { id: "p-pharmacy", roomNumber: "P05", name: "Farmacie", category: "pharmacy", floor: 0, x: 200, y: 170, w: 160, h: 80, description: "Farmacie internă - ridicare rețete, medicamente OTC.", hours: "L-V: 08:00-20:00, S: 09:00-14:00", phone: "ext. 201", doorSide: "top" },
    { id: "p-cafeteria", roomNumber: "P06", name: "Cafeteria", category: "cafeteria", floor: 0, x: 30, y: 340, w: 200, h: 120, description: "Cafeteria spitalului. Meniu zilnic, sandwich-uri, cafea, sucuri.", hours: "L-D: 07:00-20:00", doorSide: "right" },
    { id: "p-elevator-1", roomNumber: "L1", name: "Lift 1", category: "elevator", floor: 0, x: 370, y: 60, w: 50, h: 60, description: "Lift principal - acces toate etajele.", doorSide: "bottom" },
    { id: "p-elevator-2", roomNumber: "L2", name: "Lift 2", category: "elevator", floor: 0, x: 370, y: 130, w: 50, h: 60, description: "Lift secundar - acces toate etajele.", doorSide: "bottom" },
    { id: "p-stairs", roomNumber: "SC", name: "Scări", category: "stairs", floor: 0, x: 370, y: 200, w: 50, h: 60, description: "Casa scărilor - acces toate etajele.", doorSide: "right" },
    { id: "p-wc-m", roomNumber: "WC-B", name: "Toalete Bărbați", category: "restroom", floor: 0, x: 370, y: 270, w: 50, h: 50, description: "Toalete publice bărbați.", doorSide: "left" },
    { id: "p-wc-f", roomNumber: "WC-F", name: "Toalete Femei", category: "restroom", floor: 0, x: 370, y: 330, w: 50, h: 50, description: "Toalete publice femei.", doorSide: "left" },
    { id: "p-triage", roomNumber: "U01", name: "Triaj Urgențe", category: "emergency", floor: 0, x: 450, y: 60, w: 150, h: 80, doctor: "Medic de gardă", description: "Camera de triaj pentru urgențe. Evaluare inițială a pacienților.", hours: "24/7", phone: "ext. 111", doorSide: "bottom" },
    { id: "p-urg1", roomNumber: "U02", name: "Urgențe - Sala 1", category: "emergency", floor: 0, x: 610, y: 60, w: 160, h: 80, doctor: "Medic de gardă", description: "Sală de examinare și tratament urgențe.", hours: "24/7", doorSide: "bottom" },
    { id: "p-urg2", roomNumber: "U03", name: "Urgențe - Sala 2", category: "emergency", floor: 0, x: 450, y: 150, w: 150, h: 80, doctor: "Medic de gardă", description: "Sală de examinare și tratament urgențe.", hours: "24/7", doorSide: "top" },
    { id: "p-urg3", roomNumber: "U04", name: "Urgențe - Observație", category: "emergency", floor: 0, x: 610, y: 150, w: 160, h: 80, description: "Sală de observație pe termen scurt (max 24h).", hours: "24/7", doorSide: "top" },
    { id: "p-urg-waiting", roomNumber: "U05", name: "Așteptare Urgențe", category: "waiting", floor: 0, x: 450, y: 240, w: 150, h: 70, description: "Sală de așteptare pentru aparținători, secția de urgențe.", doorSide: "top" },
    { id: "p-ambulance", roomNumber: "AMB", name: "Acces Ambulanțe", category: "emergency", floor: 0, x: 610, y: 240, w: 160, h: 70, description: "Zona de acces pentru ambulanțe. Rampă dedicată.", hours: "24/7", doorSide: "right" },
    { id: "p-storage", roomNumber: "P07", name: "Depozit Medical", category: "utility", floor: 0, x: 450, y: 340, w: 160, h: 60, description: "Depozit materiale și echipamente medicale.", doorSide: "top" },
    { id: "p-tech", roomNumber: "P08", name: "Cameră Tehnică", category: "utility", floor: 0, x: 620, y: 340, w: 150, h: 60, description: "Cameră echipamente tehnice (electricitate, aer condiționat).", doorSide: "left" },
  ],
  corridors: [
    { x: 30, y: 260, w: 340, h: 70, label: "Coridor Principal" },
    { x: 420, y: 60, w: 30, h: 350 },
    { x: 200, y: 250, w: 170, h: 80 },
    { x: 600, y: 150, w: 10, h: 160 },
  ],
};

// Etaj 1 — Consultații (fiecare cabinet = o cameră cu doctor)
const FLOOR_1: FloorPlan = {
  number: 1,
  name: "Etaj 1 — Consultații",
  label: "Cabinete medicale, fiecare cu doctorul asignat",
  rooms: [
    { id: "c101", roomNumber: "C101", name: "Cabinet Cardiologie", category: "consultation", floor: 1, x: 30, y: 60, w: 130, h: 90, doctor: "Dr. Ion Popescu", specialty: "Cardiologie", description: "Cabinet consultații cardiologie. EKG, ecocardiografie.", hours: "L-V: 10:00-18:00", phone: "ext. 101", doorSide: "bottom" },
    { id: "c102", roomNumber: "C102", name: "Cabinet Dermatologie", category: "consultation", floor: 1, x: 170, y: 60, w: 130, h: 90, doctor: "Dr. Maria Ionescu", specialty: "Dermatologie", description: "Cabinet dermatologie. Dermatoscopie, tratamente laser.", hours: "L-V: 10:00-18:00", phone: "ext. 102", doorSide: "bottom" },
    { id: "c103", roomNumber: "C103", name: "Cabinet Endocrinologie", category: "consultation", floor: 1, x: 310, y: 60, w: 130, h: 90, doctor: "Dr. Alexandru Georgescu", specialty: "Endocrinologie", description: "Cabinet endocrinologie. Diagnostic și tratament diabet, tiroidă.", hours: "L-V: 10:00-18:00", phone: "ext. 103", doorSide: "bottom" },
    { id: "c104", roomNumber: "C104", name: "Cabinet Gastroenterologie", category: "consultation", floor: 1, x: 450, y: 60, w: 130, h: 90, doctor: "Dr. Elena Radu", specialty: "Gastroenterologie", description: "Cabinet gastroenterologie. Ecografie abdominală.", hours: "L-V: 10:00-18:00", phone: "ext. 104", doorSide: "bottom" },
    { id: "c105", roomNumber: "C105", name: "Cabinet Neurologie", category: "consultation", floor: 1, x: 590, y: 60, w: 130, h: 90, doctor: "Dr. Andrei Stanciu", specialty: "Neurologie", description: "Cabinet neurologie. EEG, evaluări neurologice.", hours: "L-V: 10:00-18:00", phone: "ext. 105", doorSide: "bottom" },
    { id: "c106", roomNumber: "C106", name: "Cabinet Oftalmologie", category: "consultation", floor: 1, x: 30, y: 230, w: 130, h: 90, doctor: "Dr. Cristina Moldovan", specialty: "Oftalmologie", description: "Cabinet oftalmologie. Examinare fond de ochi, tonometrie.", hours: "L-V: 10:00-18:00", phone: "ext. 106", doorSide: "top" },
    { id: "c107", roomNumber: "C107", name: "Cabinet Ortopedie", category: "consultation", floor: 1, x: 170, y: 230, w: 130, h: 90, doctor: "Dr. Florin Dumitrescu", specialty: "Ortopedie", description: "Cabinet ortopedie. Evaluare articulară, ecografie MSK.", hours: "L-V: 10:00-18:00", phone: "ext. 107", doorSide: "top" },
    { id: "c108", roomNumber: "C108", name: "Cabinet Pediatrie", category: "consultation", floor: 1, x: 310, y: 230, w: 130, h: 90, doctor: "Dr. Ana-Maria Constantinescu", specialty: "Pediatrie", description: "Cabinet pediatrie. Consultații copii și adolescenți.", hours: "L-V: 10:00-18:00", phone: "ext. 108", doorSide: "top" },
    { id: "c109", roomNumber: "C109", name: "Cabinet Psihiatrie", category: "consultation", floor: 1, x: 450, y: 230, w: 130, h: 90, doctor: "Dr. Bogdan Nistor", specialty: "Psihiatrie", description: "Cabinet psihiatrie. Evaluare psihologică, terapie.", hours: "L-V: 10:00-18:00", phone: "ext. 109", doorSide: "top" },
    { id: "c110", roomNumber: "C110", name: "Cabinet Urologie", category: "consultation", floor: 1, x: 590, y: 230, w: 130, h: 90, doctor: "Dr. Ioana Petrescu", specialty: "Urologie", description: "Cabinet urologie. Ecografie renală, cistoscopie.", hours: "L-V: 10:00-18:00", phone: "ext. 110", doorSide: "top" },
    { id: "c111", roomNumber: "C111", name: "Cabinet Chirurgie 1", category: "consultation", floor: 1, x: 30, y: 340, w: 130, h: 90, doctor: "Dr. Victor Marinescu", specialty: "Chirurgie", description: "Cabinet chirurgie generală. Consultații preoperatorii.", hours: "L-V: 10:00-18:00", phone: "ext. 111", doorSide: "top" },
    { id: "c112", roomNumber: "C112", name: "Cabinet Chirurgie 2", category: "consultation", floor: 1, x: 170, y: 340, w: 130, h: 90, doctor: "Dr. Raluca Enache", specialty: "Chirurgie", description: "Cabinet chirurgie generală. Consultații și evaluări.", hours: "L-V: 10:00-18:00", phone: "ext. 112", doorSide: "top" },
    { id: "c113", roomNumber: "C113", name: "Cabinet Analize", category: "consultation", floor: 1, x: 310, y: 340, w: 130, h: 90, doctor: "Dr. Laura Popa", specialty: "Analize medicale", description: "Cabinet analize și interpretare rezultate.", hours: "L-V: 10:00-18:00", phone: "ext. 113", doorSide: "top" },
    { id: "1-wait-1", roomNumber: "A1", name: "Așteptare Aripa Stângă", category: "waiting", floor: 1, x: 730, y: 60, w: 40, h: 260, description: "Sală de așteptare aripa stângă. Scaune, WiFi.", doorSide: "left" },
    { id: "1-elevator", roomNumber: "L1", name: "Lift", category: "elevator", floor: 1, x: 450, y: 340, w: 50, h: 50, description: "Lift - acces toate etajele.", doorSide: "left" },
    { id: "1-stairs", roomNumber: "SC", name: "Scări", category: "stairs", floor: 1, x: 510, y: 340, w: 50, h: 50, description: "Casa scărilor.", doorSide: "left" },
    { id: "1-wc", roomNumber: "WC", name: "Toalete", category: "restroom", floor: 1, x: 570, y: 340, w: 60, h: 50, description: "Toalete publice.", doorSide: "top" },
    { id: "1-nurse", roomNumber: "PM", name: "Post Asistente", category: "nurses", floor: 1, x: 640, y: 340, w: 130, h: 90, description: "Postul asistentelor. Informații pacienți, triaj consultații.", hours: "L-V: 08:00-20:00", doorSide: "top" },
  ],
  corridors: [
    { x: 30, y: 155, w: 740, h: 70, label: "Coridor Principal Etaj 1" },
    { x: 30, y: 325, w: 740, h: 10 },
  ],
};

// Etaj 2 — Imagistică
const FLOOR_2: FloorPlan = {
  number: 2,
  name: "Etaj 2 — Imagistică",
  label: "RMN, CT, Ecografie, Radiologie, Mamografie",
  rooms: [
    { id: "i-mri", roomNumber: "I01", name: "RMN", category: "imaging", floor: 2, x: 30, y: 60, w: 180, h: 120, description: "Rezonanță magnetică nucleară 3T. Programare obligatorie. Durata: ~45 min. Fără obiecte metalice!", hours: "L-V: 08:00-18:00", phone: "ext. 301", doorSide: "right" },
    { id: "i-mri-ctrl", roomNumber: "I01-C", name: "Control RMN", category: "utility", floor: 2, x: 220, y: 60, w: 80, h: 60, description: "Cameră de comandă RMN. Acces restricționat.", doorSide: "bottom" },
    { id: "i-mri-change", roomNumber: "I01-V", name: "Vestiar RMN", category: "utility", floor: 2, x: 220, y: 130, w: 80, h: 50, description: "Vestiar pentru pacienții RMN. Dulapuri securizate.", doorSide: "left" },
    { id: "i-ct", roomNumber: "I02", name: "CT Scan", category: "imaging", floor: 2, x: 30, y: 230, w: 180, h: 100, description: "Tomografie computerizată 128 slice. Programare obligatorie. Durata: ~30 min.", hours: "L-V: 08:00-18:00", phone: "ext. 302", doorSide: "right" },
    { id: "i-ct-ctrl", roomNumber: "I02-C", name: "Control CT", category: "utility", floor: 2, x: 220, y: 230, w: 80, h: 50, description: "Cameră de comandă CT.", doorSide: "bottom" },
    { id: "i-echo1", roomNumber: "I03", name: "Ecografie 1", category: "imaging", floor: 2, x: 450, y: 60, w: 140, h: 90, doctor: "Dr. Carmen Dumitrescu", specialty: "Cardiologie", description: "Ecografie cardiologică și abdominală.", hours: "L-V: 08:00-18:00", phone: "ext. 303", doorSide: "bottom" },
    { id: "i-echo2", roomNumber: "I04", name: "Ecografie 2", category: "imaging", floor: 2, x: 600, y: 60, w: 140, h: 90, description: "Ecografie generală.", hours: "L-V: 08:00-18:00", phone: "ext. 304", doorSide: "bottom" },
    { id: "i-xray", roomNumber: "I05", name: "Radiologie", category: "imaging", floor: 2, x: 450, y: 230, w: 140, h: 100, description: "Radiografie digitală. Rezultate disponibile imediat.", hours: "L-V: 08:00-18:00", phone: "ext. 305", doorSide: "top" },
    { id: "i-mammo", roomNumber: "I06", name: "Mamografie", category: "imaging", floor: 2, x: 600, y: 230, w: 140, h: 100, description: "Mamografie digitală cu tomossinteză.", hours: "L-V: 08:00-18:00", phone: "ext. 306", doorSide: "top" },
    { id: "i-waiting", roomNumber: "A2", name: "Sală de așteptare", category: "waiting", floor: 2, x: 310, y: 60, w: 130, h: 120, description: "Sală de așteptare imagistică. Schimb vestimentar disponibil.", doorSide: "bottom" },
    { id: "i-results", roomNumber: "I07", name: "Birou Rezultate", category: "office", floor: 2, x: 310, y: 280, w: 130, h: 50, description: "Birou eliberare rezultate imagistice.", hours: "L-V: 10:00-18:00", doorSide: "top" },
    { id: "2-elevator", roomNumber: "L1", name: "Lift", category: "elevator", floor: 2, x: 310, y: 230, w: 50, h: 40, description: "Lift - acces toate etajele.", doorSide: "right" },
    { id: "2-stairs", roomNumber: "SC", name: "Scări", category: "stairs", floor: 2, x: 370, y: 230, w: 50, h: 40, description: "Casa scărilor.", doorSide: "left" },
    { id: "2-wc", roomNumber: "WC", name: "Toalete", category: "restroom", floor: 2, x: 450, y: 340, w: 80, h: 50, description: "Toalete publice.", doorSide: "top" },
    { id: "i-server", roomNumber: "PACS", name: "Server PACS", category: "utility", floor: 2, x: 600, y: 340, w: 140, h: 50, description: "Cameră servere PACS. Stocare imagini medicale. Acces restricționat.", doorSide: "left" },
  ],
  corridors: [
    { x: 30, y: 185, w: 740, h: 40, label: "Coridor Imagistică" },
    { x: 310, y: 185, w: 430, h: 40 },
    { x: 440, y: 155, w: 10, h: 185 },
  ],
};

// Etaj 3 — Laborator
const FLOOR_3: FloorPlan = {
  number: 3,
  name: "Etaj 3 — Laborator",
  label: "Recoltare, procesare probe, eliberare rezultate",
  rooms: [
    { id: "l-blood1", roomNumber: "L01", name: "Recoltare Sânge 1", category: "lab", floor: 3, x: 30, y: 60, w: 130, h: 90, description: "Punct recoltare sânge. Dimineața (07:00-10:00) a jeun.", hours: "L-V: 07:00-14:00, S: 08:00-12:00", phone: "ext. 401", doorSide: "bottom" },
    { id: "l-blood2", roomNumber: "L02", name: "Recoltare Sânge 2", category: "lab", floor: 3, x: 170, y: 60, w: 130, h: 90, description: "Punct recoltare sânge suplimentar.", hours: "L-V: 07:00-14:00", phone: "ext. 402", doorSide: "bottom" },
    { id: "l-urine", roomNumber: "L03", name: "Recoltare Urină/Probe", category: "lab", floor: 3, x: 310, y: 60, w: 130, h: 90, description: "Recoltare probe biologice (urină, coprocultură). Instrucțiuni la recepție.", hours: "L-V: 07:00-14:00", phone: "ext. 403", doorSide: "bottom" },
    { id: "l-waiting", roomNumber: "A3", name: "Sală de așteptare", category: "waiting", floor: 3, x: 450, y: 60, w: 180, h: 90, description: "Sală de așteptare laborator. Bonuri de ordine.", doorSide: "bottom" },
    { id: "l-process", roomNumber: "L04", name: "Procesare Probe", category: "lab", floor: 3, x: 30, y: 230, w: 200, h: 100, description: "Laborator procesare probe. Acces restricționat personalului.", doorSide: "top" },
    { id: "l-micro", roomNumber: "L05", name: "Microbiologie", category: "lab", floor: 3, x: 240, y: 230, w: 160, h: 100, description: "Laborator microbiologie. Culturi bacteriene, antibiograme.", doorSide: "top" },
    { id: "l-results", roomNumber: "L06", name: "Eliberare Rezultate", category: "office", floor: 3, x: 450, y: 230, w: 140, h: 80, description: "Birou eliberare rezultate. Disponibile și online în contul dumneavoastră.", hours: "L-V: 08:00-18:00", phone: "ext. 404", doorSide: "top" },
    { id: "l-office", roomNumber: "L07", name: "Birou Laborator Șef", category: "office", floor: 3, x: 600, y: 230, w: 130, h: 80, description: "Biroul medicului șef de laborator.", hours: "L-V: 08:00-16:00", doorSide: "top" },
    { id: "l-storage", roomNumber: "L08", name: "Depozit Reactivi", category: "utility", floor: 3, x: 30, y: 340, w: 160, h: 70, description: "Depozit reactivi și consumabile laborator.", doorSide: "right" },
    { id: "3-elevator", roomNumber: "L1", name: "Lift", category: "elevator", floor: 3, x: 640, y: 60, w: 50, h: 50, description: "Lift - acces toate etajele.", doorSide: "left" },
    { id: "3-stairs", roomNumber: "SC", name: "Scări", category: "stairs", floor: 3, x: 700, y: 60, w: 50, h: 50, description: "Casa scărilor.", doorSide: "left" },
    { id: "3-wc", roomNumber: "WC", name: "Toalete", category: "restroom", floor: 3, x: 640, y: 120, w: 110, h: 40, description: "Toalete publice.", doorSide: "bottom" },
  ],
  corridors: [
    { x: 30, y: 155, w: 610, h: 70, label: "Coridor Laborator" },
    { x: 640, y: 110, w: 110, h: 120 },
  ],
};

// Etaj 4 — Spitalizare
const FLOOR_4: FloorPlan = {
  number: 4,
  name: "Etaj 4 — Spitalizare",
  label: "Saloane, post medical, tratamente",
  rooms: [
    { id: "s401", roomNumber: "S401", name: "Salon 401 (2 paturi)", category: "ward", floor: 4, x: 30, y: 60, w: 120, h: 80, description: "Salon cu 2 paturi. Baie proprie, TV, WiFi.", hours: "Vizite: 14:00-19:00", doorSide: "bottom" },
    { id: "s402", roomNumber: "S402", name: "Salon 402 (2 paturi)", category: "ward", floor: 4, x: 160, y: 60, w: 120, h: 80, description: "Salon cu 2 paturi. Baie proprie, TV, WiFi.", hours: "Vizite: 14:00-19:00", doorSide: "bottom" },
    { id: "s403", roomNumber: "S403", name: "Salon 403 (4 paturi)", category: "ward", floor: 4, x: 290, y: 60, w: 150, h: 80, description: "Salon cu 4 paturi. Baie proprie, TV, WiFi.", hours: "Vizite: 14:00-19:00", doorSide: "bottom" },
    { id: "s404", roomNumber: "S404", name: "Salon 404 (1 pat VIP)", category: "ward", floor: 4, x: 450, y: 60, w: 120, h: 80, description: "Salon VIP cu 1 pat. Baie privată, TV, mini-frigider.", hours: "Vizite: 14:00-19:00", doorSide: "bottom" },
    { id: "s405", roomNumber: "S405", name: "Salon 405 (2 paturi)", category: "ward", floor: 4, x: 580, y: 60, w: 120, h: 80, description: "Salon cu 2 paturi. Baie proprie, TV, WiFi.", hours: "Vizite: 14:00-19:00", doorSide: "bottom" },
    { id: "s406", roomNumber: "S406", name: "Salon 406 (2 paturi)", category: "ward", floor: 4, x: 30, y: 240, w: 120, h: 80, description: "Salon cu 2 paturi. Baie proprie, TV, WiFi.", hours: "Vizite: 14:00-19:00", doorSide: "top" },
    { id: "s407", roomNumber: "S407", name: "Salon 407 (4 paturi)", category: "ward", floor: 4, x: 160, y: 240, w: 150, h: 80, description: "Salon cu 4 paturi. Baie proprie, TV, WiFi.", hours: "Vizite: 14:00-19:00", doorSide: "top" },
    { id: "s408", roomNumber: "S408", name: "Salon 408 (2 paturi)", category: "ward", floor: 4, x: 320, y: 240, w: 120, h: 80, description: "Salon cu 2 paturi. Baie proprie, TV, WiFi.", hours: "Vizite: 14:00-19:00", doorSide: "top" },
    { id: "4-nurses", roomNumber: "PM4", name: "Post Asistente", category: "nurses", floor: 4, x: 450, y: 240, w: 130, h: 80, description: "Post medical central. Informații despre pacienți internați, apel asistentă.", hours: "24/7", phone: "ext. 400", doorSide: "top" },
    { id: "4-treatment", roomNumber: "T401", name: "Salon Tratamente", category: "ward", floor: 4, x: 590, y: 240, w: 120, h: 80, description: "Salon pentru tratamente (perfuzii, pansamente).", hours: "24/7", doorSide: "top" },
    { id: "4-office", roomNumber: "B401", name: "Birou Medic Secție", category: "office", floor: 4, x: 710, y: 60, w: 60, h: 260, doctor: "Dr. Lucian Munteanu", specialty: "Cardiologie", description: "Biroul medicului șef de secție.", hours: "L-V: 08:00-16:00", doorSide: "left" },
    { id: "4-elevator", roomNumber: "L1", name: "Lift", category: "elevator", floor: 4, x: 450, y: 340, w: 50, h: 50, description: "Lift - acces toate etajele.", doorSide: "top" },
    { id: "4-stairs", roomNumber: "SC", name: "Scări", category: "stairs", floor: 4, x: 510, y: 340, w: 50, h: 50, description: "Casa scărilor.", doorSide: "top" },
    { id: "4-wc", roomNumber: "WC", name: "Toalete Vizitatori", category: "restroom", floor: 4, x: 570, y: 340, w: 80, h: 50, description: "Toalete pentru vizitatori.", doorSide: "top" },
    { id: "4-kitchen", roomNumber: "K4", name: "Oficiu Alimentar", category: "utility", floor: 4, x: 660, y: 340, w: 110, h: 50, description: "Oficiu alimentar. Distribuire mese pacienți.", hours: "06:00-20:00", doorSide: "left" },
  ],
  corridors: [
    { x: 30, y: 145, w: 680, h: 90, label: "Coridor Spitalizare" },
    { x: 30, y: 325, w: 420, h: 10 },
  ],
};

// Etaj 5 — ATI
const FLOOR_5: FloorPlan = {
  number: 5,
  name: "Etaj 5 — ATI (Terapie Intensivă)",
  label: "Paturi ATI, monitorizare continuă, acces restricționat",
  rooms: [
    { id: "ati1", roomNumber: "ATI-1", name: "Pat ATI 1", category: "icu", floor: 5, x: 30, y: 60, w: 100, h: 100, description: "Pat terapie intensivă cu monitorizare continuă. Ventilator mecanic disponibil.", hours: "24/7", doorSide: "right" },
    { id: "ati2", roomNumber: "ATI-2", name: "Pat ATI 2", category: "icu", floor: 5, x: 140, y: 60, w: 100, h: 100, description: "Pat terapie intensivă cu monitorizare continuă.", hours: "24/7", doorSide: "right" },
    { id: "ati3", roomNumber: "ATI-3", name: "Pat ATI 3", category: "icu", floor: 5, x: 250, y: 60, w: 100, h: 100, description: "Pat terapie intensivă cu monitorizare continuă.", hours: "24/7", doorSide: "right" },
    { id: "ati4", roomNumber: "ATI-4", name: "Pat ATI 4", category: "icu", floor: 5, x: 360, y: 60, w: 100, h: 100, description: "Pat terapie intensivă cu monitorizare continuă.", hours: "24/7", doorSide: "right" },
    { id: "ati5", roomNumber: "ATI-5", name: "Pat ATI 5 (Izolare)", category: "icu", floor: 5, x: 470, y: 60, w: 120, h: 100, description: "Pat terapie intensivă în cameră de izolare. Presiune negativă.", hours: "24/7", doorSide: "bottom" },
    { id: "ati6", roomNumber: "ATI-6", name: "Pat ATI 6 (Izolare)", category: "icu", floor: 5, x: 600, y: 60, w: 120, h: 100, description: "Pat terapie intensivă în cameră de izolare.", hours: "24/7", doorSide: "bottom" },
    { id: "ati-monitor", roomNumber: "MON", name: "Stație Monitorizare", category: "nurses", floor: 5, x: 250, y: 230, w: 200, h: 90, description: "Stație centrală monitorizare. Toți parametrii vitali ai pacienților ATI sunt vizualizați aici.", hours: "24/7", phone: "ext. 501", doorSide: "top" },
    { id: "ati-meds", roomNumber: "MED", name: "Depozit Medicamente ATI", category: "utility", floor: 5, x: 30, y: 230, w: 100, h: 90, description: "Depozit medicamente și consumabile ATI. Acces restricționat.", doorSide: "right" },
    { id: "ati-equip", roomNumber: "EQ", name: "Echipamente", category: "utility", floor: 5, x: 140, y: 230, w: 100, h: 90, description: "Depozit echipamente medicale (ventilatoare, monitoare).", doorSide: "right" },
    { id: "ati-office", roomNumber: "B-ATI", name: "Birou Medic ATI", category: "office", floor: 5, x: 460, y: 230, w: 130, h: 90, description: "Biroul medicului șef ATI.", hours: "24/7", phone: "ext. 502", doorSide: "left" },
    { id: "ati-waiting", roomNumber: "A-ATI", name: "Așteptare Familii", category: "waiting", floor: 5, x: 600, y: 230, w: 130, h: 90, description: "Sală de așteptare pentru familiile pacienților ATI.", hours: "Vizite: 15:00-16:00, 19:00-20:00", doorSide: "top" },
    { id: "5-elevator", roomNumber: "L1", name: "Lift", category: "elevator", floor: 5, x: 30, y: 340, w: 50, h: 50, description: "Lift - acces toate etajele.", doorSide: "top" },
    { id: "5-stairs", roomNumber: "SC", name: "Scări", category: "stairs", floor: 5, x: 90, y: 340, w: 50, h: 50, description: "Casa scărilor.", doorSide: "top" },
    { id: "5-wc", roomNumber: "WC", name: "Toalete", category: "restroom", floor: 5, x: 150, y: 340, w: 80, h: 50, description: "Toalete personal / vizitatori.", doorSide: "top" },
  ],
  corridors: [
    { x: 30, y: 165, w: 700, h: 60, label: "Coridor ATI — Acces Restricționat" },
    { x: 30, y: 325, w: 200, h: 10 },
  ],
};

export const HOSPITAL_FLOORS: FloorPlan[] = [FLOOR_0, FLOOR_1, FLOOR_2, FLOOR_3, FLOOR_4, FLOOR_5];

export const BUILDING_DIMENSIONS = { w: BUILDING_W, h: BUILDING_H };

export function getAllRooms(): Room[] {
  return HOSPITAL_FLOORS.flatMap((f) => f.rooms);
}

export function searchRooms(query: string): Room[] {
  const q = query.toLowerCase();
  return getAllRooms().filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.roomNumber.toLowerCase().includes(q) ||
      (r.doctor && r.doctor.toLowerCase().includes(q)) ||
      (r.specialty && r.specialty.toLowerCase().includes(q)) ||
      r.description.toLowerCase().includes(q)
  );
}
