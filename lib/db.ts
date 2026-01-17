import Database from "better-sqlite3";
import { join } from "path";
import { mkdir } from "fs/promises";
import { randomUUID } from "crypto";

// Creează directorul pentru baza de date dacă nu există
const dbDir = join(process.cwd(), "data");
const dbPath = join(dbDir, "carepulse.db");

// Asigură-te că directorul există
mkdir(dbDir, { recursive: true }).catch(console.error);

// Creează conexiunea la baza de date
const db = new Database(dbPath);

// Activează foreign keys
db.pragma("foreign_keys = ON");

// Migrare pentru câmpuri noi în tabelul patients
try {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='patients';").get();
  if (tableExists) {
    const tableInfo = db.prepare("PRAGMA table_info(patients)").all() as any[];
    const hasBloodType = tableInfo.some((col) => col.name === "bloodType");
    
    if (!hasBloodType) {
      db.pragma("foreign_keys = OFF");
      db.exec(`
        ALTER TABLE patients ADD COLUMN bloodType TEXT;
        ALTER TABLE patients ADD COLUMN height REAL;
        ALTER TABLE patients ADD COLUMN weight REAL;
        ALTER TABLE patients ADD COLUMN cardiovascularDiseases TEXT;
        ALTER TABLE patients ADD COLUMN chronicDiseases TEXT;
        ALTER TABLE patients ADD COLUMN surgeries TEXT;
        ALTER TABLE patients ADD COLUMN vaccinations TEXT;
        ALTER TABLE patients ADD COLUMN smokingStatus TEXT;
        ALTER TABLE patients ADD COLUMN alcoholConsumption TEXT;
        ALTER TABLE patients ADD COLUMN exerciseFrequency TEXT;
      `);
      db.pragma("foreign_keys = ON");
    }
  }
} catch (error) {
  console.error("Migration error:", error);
  db.pragma("foreign_keys = ON");
}

// Migrare pentru câmpuri noi în tabelul emergency_cases
try {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='emergency_cases';").get();
  if (tableExists) {
    const tableInfo = db.prepare("PRAGMA table_info(emergency_cases)").all() as any[];
    const hasPatientName = tableInfo.some((col) => col.name === "patientName");
    
    if (!hasPatientName) {
      db.pragma("foreign_keys = OFF");
      
      // Adaugă coloanele noi
      db.exec(`
        ALTER TABLE emergency_cases ADD COLUMN patientName TEXT;
        ALTER TABLE emergency_cases ADD COLUMN patientPhone TEXT;
        ALTER TABLE emergency_cases ADD COLUMN patientAge TEXT;
        ALTER TABLE emergency_cases ADD COLUMN patientGender TEXT;
      `);
      
      // Verifică dacă patientId este NOT NULL și recreează tabelul dacă e necesar
      const patientIdCol = tableInfo.find((col) => col.name === "patientId");
      if (patientIdCol && patientIdCol.notnull === 1) {
        // Recreează tabelul cu patientId nullable
        db.exec(`
          CREATE TABLE emergency_cases_new (
            id TEXT PRIMARY KEY,
            patientId TEXT,
            patientName TEXT,
            patientPhone TEXT,
            patientAge TEXT,
            patientGender TEXT,
            triageLevel TEXT NOT NULL DEFAULT 'normal',
            currentState TEXT NOT NULL DEFAULT 'arrival',
            assignedDoctorId TEXT,
            arrivalTime TEXT NOT NULL DEFAULT (datetime('now')),
            triageTime TEXT,
            admissionTime TEXT,
            dischargeTime TEXT,
            priority INTEGER NOT NULL DEFAULT 3,
            chiefComplaint TEXT NOT NULL,
            vitalSigns TEXT,
            consentGiven INTEGER NOT NULL DEFAULT 0,
            carePlan TEXT,
            dischargeLetter TEXT,
            skipReason TEXT,
            createdAt TEXT NOT NULL DEFAULT (datetime('now')),
            updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
          );
          
          INSERT INTO emergency_cases_new 
          SELECT id, patientId, patientName, patientPhone, patientAge, patientGender,
                 triageLevel, currentState, assignedDoctorId, arrivalTime, triageTime,
                 admissionTime, dischargeTime, priority, chiefComplaint, vitalSigns,
                 consentGiven, carePlan, dischargeLetter, skipReason, createdAt, updatedAt
          FROM emergency_cases;
          
          DROP TABLE emergency_cases;
          ALTER TABLE emergency_cases_new RENAME TO emergency_cases;
        `);
        
        // Recreează foreign key constraint
        db.exec(`
          CREATE INDEX IF NOT EXISTS idx_emergency_cases_patientId ON emergency_cases(patientId);
          CREATE INDEX IF NOT EXISTS idx_emergency_cases_currentState ON emergency_cases(currentState);
        `);
      }
      
      db.pragma("foreign_keys = ON");
    }
  }
} catch (error) {
  console.error("Migration error for emergency_cases:", error);
  db.pragma("foreign_keys = ON");
}

// Migrare pentru câmpuri noi în tabelul appointments
try {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='appointments';").get();
  if (tableExists) {
    const tableInfo = db.prepare("PRAGMA table_info(appointments)").all() as any[];
    const hasAnalysisResults = tableInfo.some((col) => col.name === "analysisResults");
    
    if (!hasAnalysisResults) {
      db.pragma("foreign_keys = OFF");
      db.exec(`
        ALTER TABLE appointments ADD COLUMN analysisResults TEXT;
      `);
      db.pragma("foreign_keys = ON");
    }
  }
} catch (error) {
  console.error("Migration error:", error);
  db.pragma("foreign_keys = ON");
}

// Creează tabelele dacă nu există
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    gender TEXT NOT NULL,
    address TEXT NOT NULL,
    occupation TEXT NOT NULL,
    emergencyContactName TEXT NOT NULL,
    emergencyContactNumber TEXT NOT NULL,
    primaryPhysician TEXT NOT NULL,
    insuranceProvider TEXT NOT NULL,
    insurancePolicyNumber TEXT NOT NULL,
    allergies TEXT,
    currentMedication TEXT,
    familyMedicalHistory TEXT,
    pastMedicalHistory TEXT,
    identificationType TEXT,
    identificationNumber TEXT,
    identificationDocumentId TEXT,
    identificationDocumentUrl TEXT,
    privacyConsent INTEGER NOT NULL DEFAULT 0,
    bloodType TEXT,
    height REAL,
    weight REAL,
    cardiovascularDiseases TEXT,
    chronicDiseases TEXT,
    surgeries TEXT,
    vaccinations TEXT,
    smokingStatus TEXT,
    alcoholConsumption TEXT,
    exerciseFrequency TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    schedule TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    primaryPhysician TEXT NOT NULL,
    reason TEXT NOT NULL,
    note TEXT,
    cancellationReason TEXT,
    analysisResults TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );

  CREATE INDEX IF NOT EXISTS idx_patients_userId ON patients(userId);
  CREATE INDEX IF NOT EXISTS idx_appointments_userId ON appointments(userId);
  CREATE INDEX IF NOT EXISTS idx_appointments_patientId ON appointments(patientId);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    appointmentId TEXT,
    isRead INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );

  CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
  CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead);
  CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications(createdAt);

  -- Tabele pentru sistemul de Primiri Urgente
  CREATE TABLE IF NOT EXISTS emergency_cases (
    id TEXT PRIMARY KEY,
    patientId TEXT,
    patientName TEXT,
    patientPhone TEXT,
    patientAge TEXT,
    patientGender TEXT,
    triageLevel TEXT NOT NULL DEFAULT 'normal',
    currentState TEXT NOT NULL DEFAULT 'arrival',
    assignedDoctorId TEXT,
    arrivalTime TEXT NOT NULL DEFAULT (datetime('now')),
    triageTime TEXT,
    admissionTime TEXT,
    dischargeTime TEXT,
    priority INTEGER NOT NULL DEFAULT 3,
    chiefComplaint TEXT NOT NULL,
    vitalSigns TEXT,
    consentGiven INTEGER NOT NULL DEFAULT 0,
    carePlan TEXT,
    dischargeLetter TEXT,
    skipReason TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS doctors_on_duty (
    id TEXT PRIMARY KEY,
    doctorName TEXT NOT NULL,
    weekStartDate TEXT NOT NULL,
    weekEndDate TEXT NOT NULL,
    specialty TEXT,
    isAvailable INTEGER NOT NULL DEFAULT 1,
    maxConcurrentEmergencies INTEGER NOT NULL DEFAULT 3,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS emergency_state_transitions (
    id TEXT PRIMARY KEY,
    emergencyCaseId TEXT NOT NULL,
    fromState TEXT NOT NULL,
    toState TEXT NOT NULL,
    transitionReason TEXT,
    performedBy TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    metadata TEXT,
    FOREIGN KEY (emergencyCaseId) REFERENCES emergency_cases(id)
  );

  CREATE TABLE IF NOT EXISTS emergency_documents (
    id TEXT PRIMARY KEY,
    emergencyCaseId TEXT NOT NULL,
    documentType TEXT NOT NULL,
    content TEXT NOT NULL,
    signedBy TEXT,
    signedAt TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (emergencyCaseId) REFERENCES emergency_cases(id)
  );

  CREATE INDEX IF NOT EXISTS idx_emergency_cases_patientId ON emergency_cases(patientId);
  CREATE INDEX IF NOT EXISTS idx_emergency_cases_currentState ON emergency_cases(currentState);
  CREATE INDEX IF NOT EXISTS idx_emergency_cases_assignedDoctorId ON emergency_cases(assignedDoctorId);
  CREATE INDEX IF NOT EXISTS idx_emergency_cases_priority ON emergency_cases(priority);
  CREATE INDEX IF NOT EXISTS idx_emergency_state_transitions_caseId ON emergency_state_transitions(emergencyCaseId);
  CREATE INDEX IF NOT EXISTS idx_emergency_documents_caseId ON emergency_documents(emergencyCaseId);

  -- Tabele pentru Terapie Intensivă (ATI)
  CREATE TABLE IF NOT EXISTS icu_rooms (
    id TEXT PRIMARY KEY,
    roomNumber INTEGER NOT NULL UNIQUE,
    maxCapacity INTEGER NOT NULL DEFAULT 6,
    currentOccupancy INTEGER NOT NULL DEFAULT 0,
    isAvailable INTEGER NOT NULL DEFAULT 1,
    equipment TEXT, -- JSON cu echipamente disponibile
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS icu_patients (
    id TEXT PRIMARY KEY,
    emergencyCaseId TEXT,
    patientId TEXT,
    patientName TEXT,
    patientPhone TEXT,
    patientAge TEXT,
    patientGender TEXT,
    roomId TEXT NOT NULL,
    bedNumber INTEGER NOT NULL,
    admissionDate TEXT NOT NULL DEFAULT (datetime('now')),
    dischargeDate TEXT,
    status TEXT NOT NULL DEFAULT 'critical', -- 'critical', 'stable', 'improving', 'deteriorating'
    assignedDoctorId TEXT,
    diagnosis TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (emergencyCaseId) REFERENCES emergency_cases(id),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (roomId) REFERENCES icu_rooms(id)
  );

  CREATE TABLE IF NOT EXISTS icu_vital_signs (
    id TEXT PRIMARY KEY,
    icuPatientId TEXT NOT NULL,
    recordedAt TEXT NOT NULL DEFAULT (datetime('now')),
    bloodPressureSystolic INTEGER,
    bloodPressureDiastolic INTEGER,
    pulse INTEGER,
    temperature REAL,
    oxygenSaturation INTEGER,
    respiratoryRate INTEGER,
    glucoseLevel REAL,
    consciousnessLevel TEXT, -- 'conscious', 'drowsy', 'unconscious'
    notes TEXT,
    recordedBy TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (icuPatientId) REFERENCES icu_patients(id)
  );

  CREATE TABLE IF NOT EXISTS icu_treatments (
    id TEXT PRIMARY KEY,
    icuPatientId TEXT NOT NULL,
    medicationName TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    route TEXT, -- 'iv', 'oral', 'injection', etc.
    startTime TEXT NOT NULL DEFAULT (datetime('now')),
    endTime TEXT,
    administeredBy TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'discontinued'
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (icuPatientId) REFERENCES icu_patients(id)
  );

  CREATE TABLE IF NOT EXISTS icu_equipment (
    id TEXT PRIMARY KEY,
    icuPatientId TEXT NOT NULL,
    equipmentType TEXT NOT NULL, -- 'ventilator', 'monitor', 'dialysis', etc.
    equipmentName TEXT,
    startTime TEXT NOT NULL DEFAULT (datetime('now')),
    endTime TEXT,
    settings TEXT, -- JSON cu setări echipament
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (icuPatientId) REFERENCES icu_patients(id)
  );

  CREATE INDEX IF NOT EXISTS idx_icu_patients_roomId ON icu_patients(roomId);
  CREATE INDEX IF NOT EXISTS idx_icu_patients_emergencyCaseId ON icu_patients(emergencyCaseId);
  CREATE INDEX IF NOT EXISTS idx_icu_patients_status ON icu_patients(status);
  CREATE INDEX IF NOT EXISTS idx_icu_vital_signs_patientId ON icu_vital_signs(icuPatientId);
  CREATE INDEX IF NOT EXISTS idx_icu_treatments_patientId ON icu_treatments(icuPatientId);
  CREATE INDEX IF NOT EXISTS idx_icu_equipment_patientId ON icu_equipment(icuPatientId);

  -- Tabele pentru Istoric Medical Complet
  CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    appointmentId TEXT,
    doctorName TEXT NOT NULL,
    recordType TEXT NOT NULL, -- 'consultation', 'diagnosis', 'procedure', 'lab_result', 'imaging', 'vaccination'
    visitDate TEXT NOT NULL DEFAULT (datetime('now')),
    chiefComplaint TEXT,
    subjectiveNotes TEXT, -- Simptome raportate de pacient
    objectiveFindings TEXT, -- Observații clinice
    assessment TEXT, -- Evaluare medicală
    plan TEXT, -- Plan de tratament
    notes TEXT, -- Note generale
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );

  CREATE TABLE IF NOT EXISTS diagnoses (
    id TEXT PRIMARY KEY,
    medicalRecordId TEXT NOT NULL,
    diagnosisCode TEXT, -- Cod ICD-10 sau alt cod standard
    diagnosisName TEXT NOT NULL,
    diagnosisType TEXT NOT NULL, -- 'primary', 'secondary', 'differential', 'rule_out'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'chronic', 'history'
    onsetDate TEXT,
    resolvedDate TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    medicalRecordId TEXT NOT NULL,
    medicationName TEXT NOT NULL,
    dosage TEXT NOT NULL, -- ex: "500mg"
    frequency TEXT NOT NULL, -- ex: "2x pe zi", "la 8 ore"
    route TEXT, -- 'oral', 'injection', 'topical', etc.
    quantity TEXT, -- ex: "30 comprimate"
    startDate TEXT NOT NULL,
    endDate TEXT,
    instructions TEXT, -- Instrucțiuni speciale
    refills INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'discontinued'
    discontinuedReason TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id)
  );

  CREATE TABLE IF NOT EXISTS vital_signs (
    id TEXT PRIMARY KEY,
    medicalRecordId TEXT NOT NULL,
    bloodPressureSystolic INTEGER,
    bloodPressureDiastolic INTEGER,
    pulse INTEGER,
    temperature REAL, -- în grade Celsius
    oxygenSaturation INTEGER, -- SpO2 %
    respiratoryRate INTEGER, -- respirații pe minut
    weight REAL, -- în kg
    height REAL, -- în cm
    bmi REAL, -- Body Mass Index
    glucoseLevel REAL, -- glicemie mg/dL
    notes TEXT,
    recordedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id)
  );

  CREATE TABLE IF NOT EXISTS lab_results (
    id TEXT PRIMARY KEY,
    medicalRecordId TEXT NOT NULL,
    appointmentId TEXT,
    testName TEXT NOT NULL,
    testCategory TEXT, -- 'blood', 'urine', 'imaging', etc.
    resultValue TEXT,
    unit TEXT,
    referenceRange TEXT, -- ex: "70-100 mg/dL"
    status TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'abnormal', 'critical'
    notes TEXT,
    performedDate TEXT NOT NULL DEFAULT (datetime('now')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );

  CREATE TABLE IF NOT EXISTS procedures (
    id TEXT PRIMARY KEY,
    medicalRecordId TEXT NOT NULL,
    procedureName TEXT NOT NULL,
    procedureCode TEXT, -- Cod CPT sau alt cod standard
    procedureDate TEXT NOT NULL,
    performedBy TEXT NOT NULL,
    location TEXT, -- 'clinic', 'hospital', 'surgery_room', etc.
    anesthesiaType TEXT,
    complications TEXT,
    outcome TEXT,
    followUpRequired INTEGER DEFAULT 0,
    followUpDate TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id)
  );

  CREATE TABLE IF NOT EXISTS allergies_adverse_reactions (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    allergenType TEXT NOT NULL, -- 'medication', 'food', 'environmental', 'other'
    allergenName TEXT NOT NULL,
    reactionType TEXT NOT NULL, -- 'allergy', 'intolerance', 'adverse_reaction'
    severity TEXT NOT NULL, -- 'mild', 'moderate', 'severe', 'life_threatening'
    symptoms TEXT,
    firstOccurrenceDate TEXT,
    lastOccurrenceDate TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved', 'history'
    notes TEXT,
    reportedBy TEXT, -- 'patient', 'doctor', 'family'
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS vaccinations (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    vaccineName TEXT NOT NULL,
    vaccineType TEXT, -- 'routine', 'travel', 'seasonal', 'special'
    administrationDate TEXT NOT NULL,
    administeredBy TEXT,
    lotNumber TEXT,
    manufacturer TEXT,
    site TEXT, -- 'left_arm', 'right_arm', 'thigh', etc.
    nextDoseDate TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS family_history (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    relation TEXT NOT NULL, -- 'mother', 'father', 'sibling', 'grandparent', etc.
    condition TEXT NOT NULL,
    ageOfOnset INTEGER,
    status TEXT, -- 'alive', 'deceased', 'unknown'
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );

  CREATE INDEX IF NOT EXISTS idx_medical_records_patientId ON medical_records(patientId);
  CREATE INDEX IF NOT EXISTS idx_medical_records_appointmentId ON medical_records(appointmentId);
  CREATE INDEX IF NOT EXISTS idx_medical_records_visitDate ON medical_records(visitDate);
  CREATE INDEX IF NOT EXISTS idx_diagnoses_medicalRecordId ON diagnoses(medicalRecordId);
  CREATE INDEX IF NOT EXISTS idx_prescriptions_medicalRecordId ON prescriptions(medicalRecordId);
  CREATE INDEX IF NOT EXISTS idx_vital_signs_medicalRecordId ON vital_signs(medicalRecordId);
  CREATE INDEX IF NOT EXISTS idx_lab_results_medicalRecordId ON lab_results(medicalRecordId);
  CREATE INDEX IF NOT EXISTS idx_procedures_medicalRecordId ON procedures(medicalRecordId);
  CREATE INDEX IF NOT EXISTS idx_allergies_patientId ON allergies_adverse_reactions(patientId);
  CREATE INDEX IF NOT EXISTS idx_vaccinations_patientId ON vaccinations(patientId);
  CREATE INDEX IF NOT EXISTS idx_family_history_patientId ON family_history(patientId);
`);

// Inițializare săli ATI (1-3, fiecare cu 6 locuri)
try {
  const roomsExist = db.prepare("SELECT COUNT(*) as count FROM icu_rooms").get() as { count: number };
  if (roomsExist.count === 0) {
    const room1Id = randomUUID();
    const room2Id = randomUUID();
    const room3Id = randomUUID();
    db.exec(`
      INSERT INTO icu_rooms (id, roomNumber, maxCapacity, currentOccupancy, isAvailable) VALUES
      ('${room1Id}', 1, 6, 0, 1),
      ('${room2Id}', 2, 6, 0, 1),
      ('${room3Id}', 3, 6, 0, 1);
    `);
  }
} catch (error) {
  // Tabelul nu există încă sau eroare la inițializare
  console.log("ICU rooms initialization:", error);
}

export default db;
