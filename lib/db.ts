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

  -- Tabele pentru sistemul de Dispecerat Ambulanțe
  CREATE TABLE IF NOT EXISTS ambulances (
    id TEXT PRIMARY KEY,
    ambulanceNumber TEXT NOT NULL UNIQUE,
    licensePlate TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'on_mission', 'at_hospital', 'maintenance', 'out_of_service'
    currentLocation TEXT, -- JSON: {lat, lng, address}
    crew TEXT, -- JSON: {driver: "Nume", medic: "Nume", assistant: "Nume"}
    equipment TEXT, -- JSON: {defibrillator: true, oxygen: true, stretcher: true, etc.}
    lastMaintenanceDate TEXT,
    nextMaintenanceDate TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ambulance_missions (
    id TEXT PRIMARY KEY,
    ambulanceId TEXT NOT NULL,
    emergencyCaseId TEXT,
    missionType TEXT NOT NULL, -- 'emergency', 'transfer', 'standby'
    priority INTEGER NOT NULL DEFAULT 3, -- 1-10, 1 = cel mai critic
    callerName TEXT,
    callerPhone TEXT NOT NULL,
    pickupLocation TEXT NOT NULL, -- JSON: {address, lat, lng}
    destinationLocation TEXT, -- JSON: {address, lat, lng} - de obicei spitalul
    patientName TEXT,
    patientAge TEXT,
    patientGender TEXT,
    chiefComplaint TEXT NOT NULL,
    estimatedArrivalTime TEXT, -- Timp estimat până la locație
    estimatedReturnTime TEXT, -- Timp estimat până la spital
    status TEXT NOT NULL DEFAULT 'dispatched', -- 'dispatched', 'en_route', 'at_scene', 'transporting', 'at_hospital', 'completed', 'cancelled'
    dispatchedAt TEXT NOT NULL DEFAULT (datetime('now')),
    enRouteAt TEXT,
    atSceneAt TEXT,
    transportingAt TEXT,
    atHospitalAt TEXT,
    completedAt TEXT,
    cancelledAt TEXT,
    cancelledReason TEXT,
    dispatcherName TEXT NOT NULL,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ambulanceId) REFERENCES ambulances(id),
    FOREIGN KEY (emergencyCaseId) REFERENCES emergency_cases(id)
  );

  CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
  CREATE INDEX IF NOT EXISTS idx_ambulance_missions_ambulanceId ON ambulance_missions(ambulanceId);
  CREATE INDEX IF NOT EXISTS idx_ambulance_missions_emergencyCaseId ON ambulance_missions(emergencyCaseId);
  CREATE INDEX IF NOT EXISTS idx_ambulance_missions_status ON ambulance_missions(status);
  CREATE INDEX IF NOT EXISTS idx_ambulance_missions_priority ON ambulance_missions(priority);

  -- Tabele pentru Management Stocuri Medicamente și Tratamente
  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    genericName TEXT,
    category TEXT NOT NULL, -- 'medication', 'infusion', 'syringe', 'supply'
    unit TEXT NOT NULL, -- 'ml', 'mg', 'tablet', 'vial', 'bag', 'unit'
    dosageForm TEXT, -- 'tablet', 'capsule', 'injection', 'infusion', 'syrup', etc.
    strength TEXT, -- ex: "500mg", "10ml", "100mg/ml"
    manufacturer TEXT,
    batchNumber TEXT,
    expirationDate TEXT,
    storageConditions TEXT, -- 'room_temperature', 'refrigerated', 'frozen'
    description TEXT,
    indications TEXT, -- JSON array cu indicații
    contraindications TEXT, -- JSON array cu contraindicații
    sideEffects TEXT, -- JSON array cu efecte secundare
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medication_stock (
    id TEXT PRIMARY KEY,
    medicationId TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'main_pharmacy', -- 'main_pharmacy', 'emergency_department', 'icu_ward', 'surgery_ward'
    quantity INTEGER NOT NULL DEFAULT 0,
    reservedQuantity INTEGER NOT NULL DEFAULT 0, -- Cantitate rezervată pentru tratamente active
    minimumStockLevel INTEGER NOT NULL DEFAULT 10, -- Nivel minim de stoc pentru alertă
    maximumStockLevel INTEGER NOT NULL DEFAULT 1000, -- Nivel maxim de stoc
    lastRestockedDate TEXT,
    lastRestockedQuantity INTEGER,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicationId) REFERENCES medications(id)
  );

  CREATE TABLE IF NOT EXISTS medication_transactions (
    id TEXT PRIMARY KEY,
    medicationId TEXT NOT NULL,
    stockId TEXT NOT NULL,
    transactionType TEXT NOT NULL, -- 'restock', 'usage', 'adjustment', 'expired', 'damaged', 'return'
    quantity INTEGER NOT NULL, -- Pozitiv pentru restock, negativ pentru usage
    reason TEXT,
    performedBy TEXT NOT NULL,
    relatedTo TEXT, -- 'icu_treatment', 'emergency_case', 'appointment', etc.
    relatedId TEXT, -- ID-ul entității legate (icu_treatment.id, emergency_case.id, etc.)
    notes TEXT,
    transactionDate TEXT NOT NULL DEFAULT (datetime('now')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicationId) REFERENCES medications(id),
    FOREIGN KEY (stockId) REFERENCES medication_stock(id)
  );

  CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
  CREATE INDEX IF NOT EXISTS idx_medication_stock_medicationId ON medication_stock(medicationId);
  CREATE INDEX IF NOT EXISTS idx_medication_stock_location ON medication_stock(location);
  CREATE INDEX IF NOT EXISTS idx_medication_transactions_medicationId ON medication_transactions(medicationId);
  CREATE INDEX IF NOT EXISTS idx_medication_transactions_stockId ON medication_transactions(stockId);
  CREATE INDEX IF NOT EXISTS idx_medication_transactions_type ON medication_transactions(transactionType);
  CREATE INDEX IF NOT EXISTS idx_medication_transactions_date ON medication_transactions(transactionDate);

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

  -- Tabele pentru Documente Medicale
  CREATE TABLE IF NOT EXISTS medical_documents (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    appointmentId TEXT, -- Opțional: asociat cu o programare specifică
    documentType TEXT NOT NULL, -- 'analysis', 'image', 'report', 'consent', 'certificate', 'other'
    category TEXT, -- 'external_analysis', 'radiology', 'laboratory', 'consultation', 'administrative', etc.
    fileName TEXT NOT NULL,
    originalFileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER NOT NULL, -- în bytes
    mimeType TEXT NOT NULL, -- 'application/pdf', 'image/jpeg', etc.
    description TEXT,
    tags TEXT, -- JSON array cu tag-uri
    uploadedBy TEXT NOT NULL, -- Numele persoanei care a uploadat
    uploadedAt TEXT NOT NULL DEFAULT (datetime('now')),
    isApproved INTEGER NOT NULL DEFAULT 1, -- 0 = în așteptare aprobare, 1 = aprobat
    approvedBy TEXT,
    approvedAt TEXT,
    version INTEGER NOT NULL DEFAULT 1, -- Pentru versioning
    parentDocumentId TEXT, -- Pentru versiuni noi ale aceluiași document
    isDeleted INTEGER NOT NULL DEFAULT 0,
    deletedAt TEXT,
    deletedBy TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );

  CREATE TABLE IF NOT EXISTS document_access_log (
    id TEXT PRIMARY KEY,
    documentId TEXT NOT NULL,
    accessedBy TEXT NOT NULL,
    accessType TEXT NOT NULL, -- 'view', 'download', 'delete', 'approve'
    accessedAt TEXT NOT NULL DEFAULT (datetime('now')),
    ipAddress TEXT,
    userAgent TEXT,
    FOREIGN KEY (documentId) REFERENCES medical_documents(id)
  );

  CREATE INDEX IF NOT EXISTS idx_medical_documents_patientId ON medical_documents(patientId);
  CREATE INDEX IF NOT EXISTS idx_medical_documents_appointmentId ON medical_documents(appointmentId);
  CREATE INDEX IF NOT EXISTS idx_medical_documents_type ON medical_documents(documentType);
  CREATE INDEX IF NOT EXISTS idx_medical_documents_category ON medical_documents(category);
  CREATE INDEX IF NOT EXISTS idx_medical_documents_uploadedAt ON medical_documents(uploadedAt);
  CREATE INDEX IF NOT EXISTS idx_document_access_log_documentId ON document_access_log(documentId);

  -- Tabela pentru Evaluări Doctori
  CREATE TABLE IF NOT EXISTS doctor_reviews (
    id TEXT PRIMARY KEY,
    appointmentId TEXT NOT NULL UNIQUE,
    patientId TEXT NOT NULL,
    doctorName TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );

  CREATE INDEX IF NOT EXISTS idx_doctor_reviews_appointmentId ON doctor_reviews(appointmentId);
  CREATE INDEX IF NOT EXISTS idx_doctor_reviews_patientId ON doctor_reviews(patientId);
  CREATE INDEX IF NOT EXISTS idx_doctor_reviews_doctorName ON doctor_reviews(doctorName);
`);

// Inițializare medicamente și stocuri
try {
  const medicationCount = db.prepare("SELECT COUNT(*) as count FROM medications").get() as { count: number };
  if (medicationCount.count === 0) {
    const commonMedications = [
      // Analgezice și antiinflamatoare
      { name: "Paracetamol", genericName: "Acetaminophen", category: "medication", unit: "ml", dosageForm: "injection", strength: "1000mg/100ml", location: "emergency_department", quantity: 50 },
      { name: "Morfina", genericName: "Morphine", category: "medication", unit: "ml", dosageForm: "injection", strength: "10mg/ml", location: "emergency_department", quantity: 30 },
      { name: "Ketorolac", genericName: "Ketorolac tromethamine", category: "medication", unit: "ml", dosageForm: "injection", strength: "30mg/ml", location: "emergency_department", quantity: 40 },
      { name: "Ibuprofen", genericName: "Ibuprofen", category: "medication", unit: "tablet", dosageForm: "tablet", strength: "400mg", location: "emergency_department", quantity: 200 },
      
      // Antibiotice
      { name: "Amoxicilină", genericName: "Amoxicillin", category: "medication", unit: "vial", dosageForm: "injection", strength: "1000mg", location: "emergency_department", quantity: 100 },
      { name: "Ceftriaxon", genericName: "Ceftriaxone", category: "medication", unit: "vial", dosageForm: "injection", strength: "1000mg", location: "emergency_department", quantity: 80 },
      { name: "Azitromicină", genericName: "Azithromycin", category: "medication", unit: "vial", dosageForm: "injection", strength: "500mg", location: "emergency_department", quantity: 60 },
      { name: "Metronidazol", genericName: "Metronidazole", category: "medication", unit: "ml", dosageForm: "infusion", strength: "500mg/100ml", location: "emergency_department", quantity: 50 },
      
      // Cardiovascular
      { name: "Adrenalină", genericName: "Epinephrine", category: "medication", unit: "ml", dosageForm: "injection", strength: "1mg/ml", location: "emergency_department", quantity: 50 },
      { name: "Atropină", genericName: "Atropine", category: "medication", unit: "ml", dosageForm: "injection", strength: "1mg/ml", location: "emergency_department", quantity: 40 },
      { name: "Aminofilină", genericName: "Aminophylline", category: "medication", unit: "ml", dosageForm: "infusion", strength: "250mg/10ml", location: "emergency_department", quantity: 30 },
      { name: "Dopamină", genericName: "Dopamine", category: "medication", unit: "ml", dosageForm: "infusion", strength: "200mg/5ml", location: "emergency_department", quantity: 25 },
      { name: "Noradrenalină", genericName: "Norepinephrine", category: "medication", unit: "ml", dosageForm: "infusion", strength: "4mg/4ml", location: "emergency_department", quantity: 20 },
      
      // Perfuzii
      { name: "Serum Fiziologic", genericName: "Sodium Chloride 0.9%", category: "infusion", unit: "bag", dosageForm: "infusion", strength: "500ml", location: "emergency_department", quantity: 200 },
      { name: "Serum Fiziologic", genericName: "Sodium Chloride 0.9%", category: "infusion", unit: "bag", dosageForm: "infusion", strength: "1000ml", location: "emergency_department", quantity: 150 },
      { name: "Glucoză 5%", genericName: "Dextrose 5%", category: "infusion", unit: "bag", dosageForm: "infusion", strength: "500ml", location: "emergency_department", quantity: 180 },
      { name: "Glucoză 5%", genericName: "Dextrose 5%", category: "infusion", unit: "bag", dosageForm: "infusion", strength: "1000ml", location: "emergency_department", quantity: 120 },
      { name: "Ringer Lactat", genericName: "Lactated Ringer's", category: "infusion", unit: "bag", dosageForm: "infusion", strength: "500ml", location: "emergency_department", quantity: 100 },
      { name: "Ringer Lactat", genericName: "Lactated Ringer's", category: "infusion", unit: "bag", dosageForm: "infusion", strength: "1000ml", location: "emergency_department", quantity: 80 },
      
      // Medicamente ATI
      { name: "Propofol", genericName: "Propofol", category: "medication", unit: "ml", dosageForm: "injection", strength: "10mg/ml", location: "icu_ward", quantity: 40 },
      { name: "Midazolam", genericName: "Midazolam", category: "medication", unit: "ml", dosageForm: "injection", strength: "5mg/ml", location: "icu_ward", quantity: 35 },
      { name: "Fentanil", genericName: "Fentanyl", category: "medication", unit: "ml", dosageForm: "injection", strength: "0.05mg/ml", location: "icu_ward", quantity: 30 },
      { name: "Vecuroniu", genericName: "Vecuronium", category: "medication", unit: "vial", dosageForm: "injection", strength: "10mg", location: "icu_ward", quantity: 25 },
      { name: "Insulină", genericName: "Insulin", category: "medication", unit: "vial", dosageForm: "injection", strength: "100UI/ml", location: "icu_ward", quantity: 50 },
      { name: "Heparină", genericName: "Heparin", category: "medication", unit: "ml", dosageForm: "injection", strength: "5000UI/ml", location: "icu_ward", quantity: 40 },
      { name: "Furosemidă", genericName: "Furosemide", category: "medication", unit: "ml", dosageForm: "injection", strength: "20mg/2ml", location: "icu_ward", quantity: 45 },
      { name: "Dobutamină", genericName: "Dobutamine", category: "medication", unit: "ml", dosageForm: "infusion", strength: "250mg/20ml", location: "icu_ward", quantity: 20 },
    ];

    commonMedications.forEach((med, index) => {
      const medId = `med-${index + 1}`;
      const stockId = `stock-${index + 1}`;
      const now = new Date().toISOString();
      
      // Inserează medicamentul
      db.prepare(`
        INSERT INTO medications (id, name, genericName, category, unit, dosageForm, strength, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        medId,
        med.name,
        med.genericName,
        med.category,
        med.unit,
        med.dosageForm,
        med.strength,
        now,
        now
      );

      // Inserează stocul
      db.prepare(`
        INSERT INTO medication_stock (id, medicationId, location, quantity, minimumStockLevel, maximumStockLevel, lastRestockedDate, lastRestockedQuantity, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 10, 1000, ?, ?, ?, ?)
      `).run(
        stockId,
        medId,
        med.location || "main_pharmacy",
        med.quantity,
        now,
        med.quantity,
        now,
        now
      );
    });
  }
} catch (error) {
  console.error("Error initializing medications:", error);
}

// Inițializare ambulanțe (6 ambulanțe)
try {
  const ambulanceCount = db.prepare("SELECT COUNT(*) as count FROM ambulances").get() as { count: number };
  if (ambulanceCount.count === 0) {
    const ambulances = [
      { number: "AMB-001", plate: "B-001-AMB", crew: { driver: "Ion Popescu", medic: "Dr. Maria Ionescu", assistant: "Ana Georgescu" } },
      { number: "AMB-002", plate: "B-002-AMB", crew: { driver: "Gheorghe Radu", medic: "Dr. Alexandru Popa", assistant: "Elena Dumitru" } },
      { number: "AMB-003", plate: "B-003-AMB", crew: { driver: "Mihai Stoica", medic: "Dr. Carmen Vasile", assistant: "Ioana Marin" } },
      { number: "AMB-004", plate: "B-004-AMB", crew: { driver: "Vasile Ionescu", medic: "Dr. Radu Constantinescu", assistant: "Maria Popescu" } },
      { number: "AMB-005", plate: "B-005-AMB", crew: { driver: "Florin Nistor", medic: "Dr. Andreea Munteanu", assistant: "Cristina Stan" } },
      { number: "AMB-006", plate: "B-006-AMB", crew: { driver: "Adrian Gheorghe", medic: "Dr. Daniela Petre", assistant: "Simona Ionescu" } },
    ];

    ambulances.forEach((amb, index) => {
      const id = `amb-${index + 1}`;
      const equipment = JSON.stringify({
        defibrillator: true,
        oxygen: true,
        stretcher: true,
        firstAidKit: true,
        monitor: true,
        ventilator: index < 2, // Primele 2 au ventilator
      });
      const crew = JSON.stringify(amb.crew);
      
      db.prepare(`
        INSERT INTO ambulances (id, ambulanceNumber, licensePlate, status, crew, equipment, createdAt, updatedAt)
        VALUES (?, ?, ?, 'available', ?, ?, datetime('now'), datetime('now'))
      `).run(id, amb.number, amb.plate, crew, equipment);
    });
  }
} catch (error) {
  console.error("Error initializing ambulances:", error);
}

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
