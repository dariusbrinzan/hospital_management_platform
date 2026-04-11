import { randomUUID } from "crypto";
import { mkdir } from "fs/promises";
import { join } from "path";

import Database from "better-sqlite3";

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
    const hasAppointmentType = tableInfo.some((col) => col.name === "appointmentType");

    if (!hasAnalysisResults) {
      db.pragma("foreign_keys = OFF");
      db.exec(`ALTER TABLE appointments ADD COLUMN analysisResults TEXT;`);
      db.pragma("foreign_keys = ON");
    }
    if (!hasAppointmentType) {
      db.pragma("foreign_keys = OFF");
      db.exec(`ALTER TABLE appointments ADD COLUMN appointmentType TEXT NOT NULL DEFAULT 'in_person';`);
      db.pragma("foreign_keys = ON");
    }
    const hasCheckedInAt = tableInfo.some((col) => col.name === "checkedInAt");
    if (!hasCheckedInAt) {
      db.pragma("foreign_keys = OFF");
      db.exec(`ALTER TABLE appointments ADD COLUMN checkedInAt TEXT;`);
      db.exec(`ALTER TABLE appointments ADD COLUMN checkInData TEXT;`);
      db.pragma("foreign_keys = ON");
    }
  }
} catch (error) {
  console.error("Migration error:", error);
  db.pragma("foreign_keys = ON");
}

// Migrare: roomStatus pentru curățenie/dezinfecție (hospital_rooms)
try {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hospital_rooms';").get();
  if (tableExists) {
    const tableInfo = db.prepare("PRAGMA table_info(hospital_rooms)").all() as any[];
    const hasRoomStatus = tableInfo.some((col) => col.name === "roomStatus");
    if (!hasRoomStatus) {
      db.pragma("foreign_keys = OFF");
      db.exec(`ALTER TABLE hospital_rooms ADD COLUMN roomStatus TEXT DEFAULT 'available';`);
      db.pragma("foreign_keys = ON");
    }
  }
} catch (error) {
  console.error("Migration hospital_rooms roomStatus:", error);
  db.pragma("foreign_keys = ON");
}

// Migrare: coloane reviewed pentru lab_results și imaging_studies (rezultate de văzut/semnat de medic)
try {
  const lrExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='lab_results';").get();
  if (lrExists) {
    const lrInfo = db.prepare("PRAGMA table_info(lab_results)").all() as any[];
    if (!lrInfo.some((c: any) => c.name === "reviewedByDoctor")) {
      db.exec(`
        ALTER TABLE lab_results ADD COLUMN reviewedByDoctor TEXT;
        ALTER TABLE lab_results ADD COLUMN reviewedAt TEXT;
        ALTER TABLE lab_results ADD COLUMN noteForPatient TEXT;
      `);
    }
  }
  const isExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='imaging_studies';").get();
  if (isExists) {
    const isInfo = db.prepare("PRAGMA table_info(imaging_studies)").all() as any[];
    if (!isInfo.some((c: any) => c.name === "reviewedByDoctor")) {
      db.exec(`
        ALTER TABLE imaging_studies ADD COLUMN reviewedByDoctor TEXT;
        ALTER TABLE imaging_studies ADD COLUMN reviewedAt TEXT;
        ALTER TABLE imaging_studies ADD COLUMN noteForPatient TEXT;
      `);
    }
  }
} catch (err) {
  console.error("Migration lab_results/imaging_studies reviewed:", err);
}

// Migrare: tabel semnături digitale pacienți
try {
  const sigExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='patient_signatures';").get();
  if (!sigExists) {
    db.exec(`
      CREATE TABLE patient_signatures (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        documentType TEXT NOT NULL,
        documentId TEXT,
        signatureData TEXT NOT NULL,
        signedAt TEXT NOT NULL DEFAULT (datetime('now')),
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (patientId) REFERENCES patients(id)
      );
      CREATE INDEX IF NOT EXISTS idx_patient_signatures_patientId ON patient_signatures(patientId);
      CREATE INDEX IF NOT EXISTS idx_patient_signatures_documentType ON patient_signatures(documentType);
      CREATE INDEX IF NOT EXISTS idx_patient_signatures_signedAt ON patient_signatures(signedAt);
    `);
  }
} catch (err) {
  console.error("Migration patient_signatures:", err);
}

// Migrare: reorderQuantity pe medication_stock
try {
  const msExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='medication_stock';").get();
  if (msExists) {
    const info = db.prepare("PRAGMA table_info(medication_stock)").all() as any[];
    if (!info.some((c) => c.name === "reorderQuantity")) {
      db.exec("ALTER TABLE medication_stock ADD COLUMN reorderQuantity INTEGER;");
    }
  }
} catch (err) {
  console.error("Migration medication_stock reorderQuantity:", err);
}

// Migrare: tabele farmacie avansată și laborator
try {
  const batchExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='medication_stock_batches';").get();
  if (!batchExists) {
    db.exec(`
      CREATE TABLE medication_stock_batches (
        id TEXT PRIMARY KEY,
        stockId TEXT NOT NULL,
        batchNumber TEXT NOT NULL,
        expirationDate TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        receivedAt TEXT NOT NULL DEFAULT (datetime('now')),
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (stockId) REFERENCES medication_stock(id)
      );
      CREATE INDEX IF NOT EXISTS idx_medication_stock_batches_stockId ON medication_stock_batches(stockId);
      CREATE INDEX IF NOT EXISTS idx_medication_stock_batches_expiration ON medication_stock_batches(expirationDate);
    `);
  }
  const orderExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pharmacy_orders';").get();
  if (!orderExists) {
    db.exec(`
      CREATE TABLE pharmacy_orders (
        id TEXT PRIMARY KEY,
        orderNumber TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'draft',
        requestedBy TEXT NOT NULL,
        requestedAt TEXT NOT NULL DEFAULT (datetime('now')),
        approvedBy TEXT,
        approvedAt TEXT,
        receivedBy TEXT,
        receivedAt TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE pharmacy_order_lines (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        medicationId TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unitPrice REAL,
        receivedQuantity INTEGER,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (orderId) REFERENCES pharmacy_orders(id),
        FOREIGN KEY (medicationId) REFERENCES medications(id)
      );
      CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_status ON pharmacy_orders(status);
      CREATE INDEX IF NOT EXISTS idx_pharmacy_order_lines_orderId ON pharmacy_order_lines(orderId);
    `);
  }
  const dispExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pharmacy_dispensings';").get();
  if (!dispExists) {
    db.exec(`
      CREATE TABLE pharmacy_dispensings (
        id TEXT PRIMARY KEY,
        prescriptionId TEXT NOT NULL,
        patientId TEXT NOT NULL,
        medicationId TEXT NOT NULL,
        stockId TEXT,
        batchId TEXT,
        quantity INTEGER NOT NULL,
        dispensedAt TEXT NOT NULL DEFAULT (datetime('now')),
        dispensedBy TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id),
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (medicationId) REFERENCES medications(id),
        FOREIGN KEY (stockId) REFERENCES medication_stock(id),
        FOREIGN KEY (batchId) REFERENCES medication_stock_batches(id)
      );
      CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensings_patientId ON pharmacy_dispensings(patientId);
      CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensings_prescriptionId ON pharmacy_dispensings(prescriptionId);
      CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensings_dispensedAt ON pharmacy_dispensings(dispensedAt);
    `);
  }
  const interExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='medication_interactions';").get();
  if (!interExists) {
    db.exec(`
      CREATE TABLE medication_interactions (
        id TEXT PRIMARY KEY,
        medicationId1 TEXT NOT NULL,
        medicationId2 TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (medicationId1) REFERENCES medications(id),
        FOREIGN KEY (medicationId2) REFERENCES medications(id),
        UNIQUE(medicationId1, medicationId2)
      );
      CREATE INDEX IF NOT EXISTS idx_medication_interactions_med1 ON medication_interactions(medicationId1);
      CREATE INDEX IF NOT EXISTS idx_medication_interactions_med2 ON medication_interactions(medicationId2);
    `);
  }
  const labTestExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='lab_test_types';").get();
  if (!labTestExists) {
    db.exec(`
      CREATE TABLE lab_test_types (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT,
        referenceRange TEXT,
        medicationId TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (medicationId) REFERENCES medications(id)
      );
      CREATE TABLE lab_orders (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        medicalRecordId TEXT,
        appointmentId TEXT,
        orderedBy TEXT NOT NULL,
        orderedAt TEXT NOT NULL DEFAULT (datetime('now')),
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'normal',
        notes TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id),
        FOREIGN KEY (appointmentId) REFERENCES appointments(id)
      );
      CREATE TABLE lab_order_tests (
        id TEXT PRIMARY KEY,
        orderId TEXT NOT NULL,
        testTypeId TEXT NOT NULL,
        medicationId TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        resultValue TEXT,
        resultUnit TEXT,
        referenceRange TEXT,
        resultAt TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (orderId) REFERENCES lab_orders(id),
        FOREIGN KEY (testTypeId) REFERENCES lab_test_types(id),
        FOREIGN KEY (medicationId) REFERENCES medications(id)
      );
      CREATE INDEX IF NOT EXISTS idx_lab_orders_patientId ON lab_orders(patientId);
      CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
      CREATE INDEX IF NOT EXISTS idx_lab_order_tests_orderId ON lab_order_tests(orderId);
    `);
  }
  const medReqExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='medication_requests';").get();
  if (!medReqExists) {
    db.exec(`
      CREATE TABLE medication_requests (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        prescriptionId TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requestedAt TEXT NOT NULL DEFAULT (datetime('now')),
        approvedBy TEXT,
        approvedAt TEXT,
        dispensedBy TEXT,
        dispensedAt TEXT,
        decontatAt TEXT,
        decontatBy TEXT,
        decontareType TEXT,
        rejectedBy TEXT,
        rejectedAt TEXT,
        rejectionReason TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (patientId) REFERENCES patients(id),
        FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id)
      );
      CREATE INDEX IF NOT EXISTS idx_medication_requests_patientId ON medication_requests(patientId);
      CREATE INDEX IF NOT EXISTS idx_medication_requests_prescriptionId ON medication_requests(prescriptionId);
      CREATE INDEX IF NOT EXISTS idx_medication_requests_status ON medication_requests(status);
    `);
  }
} catch (err) {
  console.error("Migration pharmacy/lab tables:", err);
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

  CREATE TABLE IF NOT EXISTS appointment_messages (
    id TEXT PRIMARY KEY,
    appointmentId TEXT NOT NULL,
    senderRole TEXT NOT NULL,
    senderName TEXT NOT NULL,
    body TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );
  CREATE INDEX IF NOT EXISTS idx_appointment_messages_appointmentId ON appointment_messages(appointmentId);

  CREATE TABLE IF NOT EXISTS doctor_notifications (
    id TEXT PRIMARY KEY,
    doctorName TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    appointmentId TEXT,
    isRead INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );
  CREATE INDEX IF NOT EXISTS idx_doctor_notifications_doctorName ON doctor_notifications(doctorName);
  CREATE INDEX IF NOT EXISTS idx_doctor_notifications_isRead ON doctor_notifications(isRead);

  CREATE TABLE IF NOT EXISTS appointment_waitlist (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    primaryPhysician TEXT NOT NULL,
    requestedSlotAt TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    assignedAppointmentId TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );
  CREATE INDEX IF NOT EXISTS idx_waitlist_userId ON appointment_waitlist(userId);
  CREATE INDEX IF NOT EXISTS idx_waitlist_physician_slot ON appointment_waitlist(primaryPhysician, requestedSlotAt);
  CREATE INDEX IF NOT EXISTS idx_waitlist_status ON appointment_waitlist(status);

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

  CREATE TABLE IF NOT EXISTS doctor_schedule_events (
    id TEXT PRIMARY KEY,
    doctorName TEXT NOT NULL,
    eventType TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    notes TEXT,
    affectsAppointments INTEGER NOT NULL DEFAULT 1,
    affectsDuty INTEGER NOT NULL DEFAULT 1,
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
  CREATE INDEX IF NOT EXISTS idx_doctor_schedule_events_doctor ON doctor_schedule_events(doctorName);
  CREATE INDEX IF NOT EXISTS idx_doctor_schedule_events_start_end ON doctor_schedule_events(startDate, endDate);
  CREATE INDEX IF NOT EXISTS idx_doctor_schedule_events_type ON doctor_schedule_events(eventType);

  -- Investigații imagistice (disponibilități + programări, integrate cu programări și urgențe)
  CREATE TABLE IF NOT EXISTS imaging_modalities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slotDurationMinutes INTEGER NOT NULL DEFAULT 30,
    description TEXT,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_imaging_modalities_active ON imaging_modalities(isActive);

  CREATE TABLE IF NOT EXISTS imaging_studies (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    modalityId TEXT NOT NULL,
    scheduledAt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    sourceType TEXT NOT NULL DEFAULT 'direct',
    sourceId TEXT,
    orderedBy TEXT,
    reason TEXT,
    resultNotes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (modalityId) REFERENCES imaging_modalities(id)
  );
  CREATE INDEX IF NOT EXISTS idx_imaging_studies_patientId ON imaging_studies(patientId);
  CREATE INDEX IF NOT EXISTS idx_imaging_studies_modalityId ON imaging_studies(modalityId);
  CREATE INDEX IF NOT EXISTS idx_imaging_studies_scheduledAt ON imaging_studies(scheduledAt);
  CREATE INDEX IF NOT EXISTS idx_imaging_studies_status ON imaging_studies(status);
  CREATE INDEX IF NOT EXISTS idx_imaging_studies_source ON imaging_studies(sourceType, sourceId);

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
    reorderQuantity INTEGER, -- Cantitate de comandat la reaprovizionare (dacă NULL, se folosește minimumStockLevel * 2)
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

  CREATE TABLE IF NOT EXISTS patient_medication_administrations (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    emergencyCaseId TEXT,
    medicationId TEXT,
    stockId TEXT,
    medicationName TEXT NOT NULL,
    dosage TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT,
    route TEXT,
    administrationPhase TEXT NOT NULL DEFAULT 'doctor_care', -- 'before_doctor', 'doctor_care'
    administeredBy TEXT,
    administeredAt TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (emergencyCaseId) REFERENCES emergency_cases(id),
    FOREIGN KEY (medicationId) REFERENCES medications(id),
    FOREIGN KEY (stockId) REFERENCES medication_stock(id)
  );

  CREATE INDEX IF NOT EXISTS idx_patient_medication_administrations_patientId ON patient_medication_administrations(patientId);
  CREATE INDEX IF NOT EXISTS idx_patient_medication_administrations_emergencyCaseId ON patient_medication_administrations(emergencyCaseId);
  CREATE INDEX IF NOT EXISTS idx_patient_medication_administrations_administeredAt ON patient_medication_administrations(administeredAt);
  CREATE INDEX IF NOT EXISTS idx_patient_medication_administrations_phase ON patient_medication_administrations(administrationPhase);

  -- Farmacie avansată: loturi, comenzi, dispensări, interacțiuni
  CREATE TABLE IF NOT EXISTS medication_stock_batches (
    id TEXT PRIMARY KEY,
    stockId TEXT NOT NULL,
    batchNumber TEXT NOT NULL,
    expirationDate TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    receivedAt TEXT NOT NULL DEFAULT (datetime('now')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (stockId) REFERENCES medication_stock(id)
  );
  CREATE INDEX IF NOT EXISTS idx_medication_stock_batches_stockId ON medication_stock_batches(stockId);
  CREATE INDEX IF NOT EXISTS idx_medication_stock_batches_expiration ON medication_stock_batches(expirationDate);

  CREATE TABLE IF NOT EXISTS pharmacy_orders (
    id TEXT PRIMARY KEY,
    orderNumber TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, approved, received, cancelled
    requestedBy TEXT NOT NULL,
    requestedAt TEXT NOT NULL DEFAULT (datetime('now')),
    approvedBy TEXT,
    approvedAt TEXT,
    receivedBy TEXT,
    receivedAt TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS pharmacy_order_lines (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    medicationId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL,
    receivedQuantity INTEGER,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (orderId) REFERENCES pharmacy_orders(id),
    FOREIGN KEY (medicationId) REFERENCES medications(id)
  );
  CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_status ON pharmacy_orders(status);
  CREATE INDEX IF NOT EXISTS idx_pharmacy_order_lines_orderId ON pharmacy_order_lines(orderId);

  CREATE TABLE IF NOT EXISTS pharmacy_dispensings (
    id TEXT PRIMARY KEY,
    prescriptionId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    medicationId TEXT NOT NULL,
    stockId TEXT,
    batchId TEXT,
    quantity INTEGER NOT NULL,
    dispensedAt TEXT NOT NULL DEFAULT (datetime('now')),
    dispensedBy TEXT NOT NULL,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (medicationId) REFERENCES medications(id),
    FOREIGN KEY (stockId) REFERENCES medication_stock(id),
    FOREIGN KEY (batchId) REFERENCES medication_stock_batches(id)
  );
  CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensings_patientId ON pharmacy_dispensings(patientId);
  CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensings_prescriptionId ON pharmacy_dispensings(prescriptionId);
  CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensings_dispensedAt ON pharmacy_dispensings(dispensedAt);

  CREATE TABLE IF NOT EXISTS medication_requests (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    prescriptionId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requestedAt TEXT NOT NULL DEFAULT (datetime('now')),
    approvedBy TEXT,
    approvedAt TEXT,
    dispensedBy TEXT,
    dispensedAt TEXT,
    decontatAt TEXT,
    decontatBy TEXT,
    decontareType TEXT,
    rejectedBy TEXT,
    rejectedAt TEXT,
    rejectionReason TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id)
  );
  CREATE INDEX IF NOT EXISTS idx_medication_requests_patientId ON medication_requests(patientId);
  CREATE INDEX IF NOT EXISTS idx_medication_requests_prescriptionId ON medication_requests(prescriptionId);
  CREATE INDEX IF NOT EXISTS idx_medication_requests_status ON medication_requests(status);

  CREATE TABLE IF NOT EXISTS medication_interactions (
    id TEXT PRIMARY KEY,
    medicationId1 TEXT NOT NULL,
    medicationId2 TEXT NOT NULL,
    severity TEXT NOT NULL, -- minor, moderate, major, contraindicated
    description TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicationId1) REFERENCES medications(id),
    FOREIGN KEY (medicationId2) REFERENCES medications(id),
    UNIQUE(medicationId1, medicationId2)
  );
  CREATE INDEX IF NOT EXISTS idx_medication_interactions_med1 ON medication_interactions(medicationId1);
  CREATE INDEX IF NOT EXISTS idx_medication_interactions_med2 ON medication_interactions(medicationId2);

  -- Laborator axat pe medicamente (TDM, analize pentru monitorizare terapie)
  CREATE TABLE IF NOT EXISTS lab_test_types (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- blood, urine, tdm, renal, hepatic, other
    unit TEXT,
    referenceRange TEXT,
    medicationId TEXT, -- pentru TDM: medicamentul monitorizat
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (medicationId) REFERENCES medications(id)
  );
  CREATE TABLE IF NOT EXISTS lab_orders (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    medicalRecordId TEXT,
    appointmentId TEXT,
    orderedBy TEXT NOT NULL,
    orderedAt TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority TEXT NOT NULL DEFAULT 'normal', -- normal, urgent, stat
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (medicalRecordId) REFERENCES medical_records(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );
  CREATE TABLE IF NOT EXISTS lab_order_tests (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    testTypeId TEXT NOT NULL,
    medicationId TEXT, -- legătură TDM
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
    resultValue TEXT,
    resultUnit TEXT,
    referenceRange TEXT,
    resultAt TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (orderId) REFERENCES lab_orders(id),
    FOREIGN KEY (testTypeId) REFERENCES lab_test_types(id),
    FOREIGN KEY (medicationId) REFERENCES medications(id)
  );
  CREATE INDEX IF NOT EXISTS idx_lab_orders_patientId ON lab_orders(patientId);
  CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON lab_orders(status);
  CREATE INDEX IF NOT EXISTS idx_lab_order_tests_orderId ON lab_order_tests(orderId);

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

  -- Tabele pentru Spitalizări Normale (non-ATI)
  CREATE TABLE IF NOT EXISTS hospital_rooms (
    id TEXT PRIMARY KEY,
    roomNumber TEXT NOT NULL UNIQUE,
    floor INTEGER NOT NULL DEFAULT 1,
    department TEXT NOT NULL,
    roomType TEXT NOT NULL DEFAULT 'standard',
    maxCapacity INTEGER NOT NULL DEFAULT 2,
    currentOccupancy INTEGER NOT NULL DEFAULT 0,
    isAvailable INTEGER NOT NULL DEFAULT 1,
    roomStatus TEXT DEFAULT 'available', -- 'available','cleaning','disinfection'
    equipment TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS hospital_admissions (
    id TEXT PRIMARY KEY,
    patientId TEXT,
    appointmentId TEXT, -- Opțional: dacă internarea vine din programare
    patientName TEXT NOT NULL,
    patientPhone TEXT,
    patientAge TEXT,
    patientGender TEXT,
    roomId TEXT NOT NULL,
    bedNumber INTEGER NOT NULL,
    admissionDate TEXT NOT NULL DEFAULT (datetime('now')),
    dischargeDate TEXT,
    admissionType TEXT NOT NULL DEFAULT 'elective', -- 'elective', 'urgent', 'emergency', 'transfer'
    admissionReason TEXT NOT NULL, -- Motivația internării
    diagnosis TEXT,
    admittingDoctor TEXT NOT NULL, -- Numele medicului care internă
    assignedDoctor TEXT, -- Medicul responsabil pentru tratament
    department TEXT NOT NULL, -- Secția unde este internat
    insuranceProvider TEXT,
    insurancePolicyNumber TEXT,
    expectedLengthOfStay INTEGER, -- Zile estimate
    status TEXT NOT NULL DEFAULT 'admitted', -- 'admitted', 'stable', 'improving', 'ready_for_discharge', 'discharged'
    dischargeInstructions TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id),
    FOREIGN KEY (roomId) REFERENCES hospital_rooms(id)
  );

  CREATE TABLE IF NOT EXISTS hospital_vital_signs (
    id TEXT PRIMARY KEY,
    admissionId TEXT NOT NULL,
    recordedAt TEXT NOT NULL DEFAULT (datetime('now')),
    bloodPressureSystolic INTEGER,
    bloodPressureDiastolic INTEGER,
    pulse INTEGER,
    temperature REAL,
    oxygenSaturation INTEGER,
    respiratoryRate INTEGER,
    glucoseLevel REAL,
    weight REAL,
    notes TEXT,
    recordedBy TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (admissionId) REFERENCES hospital_admissions(id)
  );

  CREATE TABLE IF NOT EXISTS hospital_treatments (
    id TEXT PRIMARY KEY,
    admissionId TEXT NOT NULL,
    medicationName TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    route TEXT, -- 'iv', 'oral', 'injection', 'topical'
    startTime TEXT NOT NULL DEFAULT (datetime('now')),
    endTime TEXT,
    administeredBy TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'discontinued'
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (admissionId) REFERENCES hospital_admissions(id)
  );

  CREATE TABLE IF NOT EXISTS hospital_procedures (
    id TEXT PRIMARY KEY,
    admissionId TEXT NOT NULL,
    procedureName TEXT NOT NULL,
    procedureDate TEXT NOT NULL,
    performedBy TEXT NOT NULL,
    procedureType TEXT, -- 'diagnostic', 'therapeutic', 'surgical', 'other'
    outcome TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (admissionId) REFERENCES hospital_admissions(id)
  );

  CREATE INDEX IF NOT EXISTS idx_hospital_rooms_department ON hospital_rooms(department);
  CREATE INDEX IF NOT EXISTS idx_hospital_rooms_roomNumber ON hospital_rooms(roomNumber);
  CREATE INDEX IF NOT EXISTS idx_hospital_admissions_patientId ON hospital_admissions(patientId);
  CREATE INDEX IF NOT EXISTS idx_hospital_admissions_roomId ON hospital_admissions(roomId);
  CREATE INDEX IF NOT EXISTS idx_hospital_admissions_status ON hospital_admissions(status);
  CREATE INDEX IF NOT EXISTS idx_hospital_admissions_department ON hospital_admissions(department);
  CREATE INDEX IF NOT EXISTS idx_hospital_vital_signs_admissionId ON hospital_vital_signs(admissionId);
  CREATE INDEX IF NOT EXISTS idx_hospital_treatments_admissionId ON hospital_treatments(admissionId);
  CREATE INDEX IF NOT EXISTS idx_hospital_procedures_admissionId ON hospital_procedures(admissionId);

  -- Foi de spitalizare și raportare CNAS
  CREATE TABLE IF NOT EXISTS hospitalization_sheets (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    admissionId TEXT,
    appointmentId TEXT,
    sheetNumber TEXT NOT NULL,
    sheetYear INTEGER NOT NULL,
    hospitalizationType TEXT NOT NULL DEFAULT 'continuous', -- continuous, day
    admissionType TEXT NOT NULL DEFAULT 'elective',
    insuranceStatus TEXT NOT NULL DEFAULT 'insured',
    cnasPayerType TEXT NOT NULL DEFAULT 'cass',
    admissionDate TEXT NOT NULL,
    dischargeDate TEXT NOT NULL,
    admissionSection TEXT NOT NULL,
    dischargeSection TEXT NOT NULL,
    attendingPhysician TEXT NOT NULL,
    admissionDiagnosis TEXT NOT NULL,
    mainDiagnosis TEXT NOT NULL,
    dischargeStatus TEXT NOT NULL,
    dischargeType TEXT NOT NULL,
    totalDays INTEGER NOT NULL DEFAULT 1,
    expectedReimbursement REAL NOT NULL DEFAULT 0,
    validationStatus TEXT NOT NULL DEFAULT 'draft', -- draft, valid, invalid
    reportStatus TEXT NOT NULL DEFAULT 'draft', -- draft, batched, submitted, accepted, rejected
    validationErrorsJson TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (admissionId) REFERENCES hospital_admissions(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id),
    UNIQUE(sheetNumber, sheetYear)
  );

  CREATE TABLE IF NOT EXISTS hospitalization_sheet_diagnoses (
    id TEXT PRIMARY KEY,
    sheetId TEXT NOT NULL,
    diagnosisCode TEXT,
    diagnosisName TEXT NOT NULL,
    diagnosisKind TEXT NOT NULL DEFAULT 'secondary', -- admission, principal, secondary
    presentOnAdmission INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sheetId) REFERENCES hospitalization_sheets(id)
  );

  CREATE TABLE IF NOT EXISTS hospitalization_sheet_procedures (
    id TEXT PRIMARY KEY,
    sheetId TEXT NOT NULL,
    procedureCode TEXT,
    procedureName TEXT NOT NULL,
    procedureKind TEXT NOT NULL DEFAULT 'diagnostic', -- diagnostic, therapeutic, surgical, administrative
    performedAt TEXT,
    performer TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sheetId) REFERENCES hospitalization_sheets(id)
  );

  CREATE TABLE IF NOT EXISTS hospitalization_reporting_batches (
    id TEXT PRIMARY KEY,
    batchMonth INTEGER NOT NULL,
    batchYear INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, validated, submitted, accepted, partially_rejected, rejected
    totalSheets INTEGER NOT NULL DEFAULT 0,
    acceptedSheets INTEGER NOT NULL DEFAULT 0,
    rejectedSheets INTEGER NOT NULL DEFAULT 0,
    exportPayload TEXT,
    responseSummary TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    validatedAt TEXT,
    submittedAt TEXT,
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS hospitalization_reporting_batch_items (
    id TEXT PRIMARY KEY,
    batchId TEXT NOT NULL,
    sheetId TEXT NOT NULL,
    itemStatus TEXT NOT NULL DEFAULT 'batched', -- batched, submitted, accepted, rejected
    responseMessage TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (batchId) REFERENCES hospitalization_reporting_batches(id),
    FOREIGN KEY (sheetId) REFERENCES hospitalization_sheets(id),
    UNIQUE(batchId, sheetId)
  );

  CREATE INDEX IF NOT EXISTS idx_hospitalization_sheets_patientId ON hospitalization_sheets(patientId);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_sheets_admissionId ON hospitalization_sheets(admissionId);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_sheets_report_status ON hospitalization_sheets(reportStatus);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_sheets_validation_status ON hospitalization_sheets(validationStatus);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_sheets_dischargeDate ON hospitalization_sheets(dischargeDate);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_sheet_diagnoses_sheetId ON hospitalization_sheet_diagnoses(sheetId);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_sheet_procedures_sheetId ON hospitalization_sheet_procedures(sheetId);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_reporting_batches_month_year ON hospitalization_reporting_batches(batchMonth, batchYear);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_reporting_batch_items_batchId ON hospitalization_reporting_batch_items(batchId);
  CREATE INDEX IF NOT EXISTS idx_hospitalization_reporting_batch_items_sheetId ON hospitalization_reporting_batch_items(sheetId);

  -- Tabele pentru Bloc Operator
  CREATE TABLE IF NOT EXISTS operating_rooms (
    id TEXT PRIMARY KEY,
    roomNumber TEXT NOT NULL UNIQUE,
    specialty TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 2,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'reserved', 'in_use', 'cleaning', 'maintenance'
    hasAnesthesiaMachine INTEGER NOT NULL DEFAULT 1,
    hasImagingSupport INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS surgery_cases (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    appointmentId TEXT,
    requestedByDoctor TEXT NOT NULL,
    surgicalSpecialty TEXT NOT NULL,
    procedureName TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'elective', -- 'elective', 'priority', 'emergency'
    estimatedDurationMinutes INTEGER NOT NULL DEFAULT 90,
    preferredDate TEXT,
    requiresICUBed INTEGER NOT NULL DEFAULT 0,
    implantNeeded INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'anesthesia_pending', -- proposed, anesthesia_pending, ready_to_schedule, scheduled, completed, cancelled
    clinicalNotes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id)
  );

  CREATE TABLE IF NOT EXISTS anesthesia_consultations (
    id TEXT PRIMARY KEY,
    surgeryCaseId TEXT NOT NULL UNIQUE,
    anesthesiologistName TEXT NOT NULL,
    consultDate TEXT NOT NULL,
    asaRisk TEXT NOT NULL,
    airwayAssessment TEXT,
    fastingConfirmed INTEGER NOT NULL DEFAULT 0,
    recommendations TEXT,
    clearanceStatus TEXT NOT NULL DEFAULT 'pending', -- pending, cleared, conditional, denied
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (surgeryCaseId) REFERENCES surgery_cases(id)
  );

  CREATE TABLE IF NOT EXISTS surgery_bookings (
    id TEXT PRIMARY KEY,
    surgeryCaseId TEXT NOT NULL UNIQUE,
    roomId TEXT NOT NULL,
    scheduledStart TEXT NOT NULL,
    scheduledEnd TEXT NOT NULL,
    surgeonName TEXT NOT NULL,
    anesthesiologistName TEXT,
    nursingTeam TEXT,
    supportTeam TEXT,
    bookingStatus TEXT NOT NULL DEFAULT 'planned', -- planned, confirmed, in_progress, completed, cancelled
    preOpChecklist TEXT,
    postopDestination TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (surgeryCaseId) REFERENCES surgery_cases(id),
    FOREIGN KEY (roomId) REFERENCES operating_rooms(id)
  );

  CREATE TABLE IF NOT EXISTS surgery_financial_cases (
    id TEXT PRIMARY KEY,
    surgeryCaseId TEXT NOT NULL UNIQUE,
    coverageType TEXT NOT NULL DEFAULT 'cass_full', -- cass_full, cass_partial, private_full, mixed
    estimatedTotal REAL NOT NULL DEFAULT 0,
    cassCoveredAmount REAL NOT NULL DEFAULT 0,
    patientAmount REAL NOT NULL DEFAULT 0,
    paymentStatus TEXT NOT NULL DEFAULT 'pending', -- pending, partially_paid, paid, exempt
    billingNotes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (surgeryCaseId) REFERENCES surgery_cases(id)
  );

  CREATE INDEX IF NOT EXISTS idx_operating_rooms_status ON operating_rooms(status);
  CREATE INDEX IF NOT EXISTS idx_operating_rooms_specialty ON operating_rooms(specialty);
  CREATE INDEX IF NOT EXISTS idx_surgery_cases_patientId ON surgery_cases(patientId);
  CREATE INDEX IF NOT EXISTS idx_surgery_cases_doctor ON surgery_cases(requestedByDoctor);
  CREATE INDEX IF NOT EXISTS idx_surgery_cases_status ON surgery_cases(status);
  CREATE INDEX IF NOT EXISTS idx_surgery_cases_preferredDate ON surgery_cases(preferredDate);
  CREATE INDEX IF NOT EXISTS idx_surgery_bookings_roomId ON surgery_bookings(roomId);
  CREATE INDEX IF NOT EXISTS idx_surgery_bookings_start_end ON surgery_bookings(scheduledStart, scheduledEnd);
  CREATE INDEX IF NOT EXISTS idx_surgery_bookings_status ON surgery_bookings(bookingStatus);
  CREATE INDEX IF NOT EXISTS idx_surgery_financial_cases_paymentStatus ON surgery_financial_cases(paymentStatus);

  CREATE TABLE IF NOT EXISTS financial_transactions (
    id TEXT PRIMARY KEY,
    transactionType TEXT NOT NULL, -- revenue, expense, deduction, reimbursement
    category TEXT NOT NULL,
    costCenter TEXT NOT NULL,
    sourceType TEXT,
    sourceId TEXT,
    patientId TEXT,
    amount REAL NOT NULL DEFAULT 0,
    taxAmount REAL NOT NULL DEFAULT 0,
    deductibleAmount REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'RON',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, paid, cancelled, reimbursed
    description TEXT NOT NULL,
    occurredAt TEXT NOT NULL DEFAULT (datetime('now')),
    createdBy TEXT,
    notes TEXT,
    metadata TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS ambulance_fuel_logs (
    id TEXT PRIMARY KEY,
    ambulanceId TEXT NOT NULL,
    liters REAL NOT NULL,
    costPerLiter REAL NOT NULL,
    totalCost REAL NOT NULL,
    odometerKm INTEGER,
    fueledAt TEXT NOT NULL DEFAULT (datetime('now')),
    stationName TEXT,
    fueledBy TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ambulanceId) REFERENCES ambulances(id)
  );

  CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transactionType);
  CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category);
  CREATE INDEX IF NOT EXISTS idx_financial_transactions_cost_center ON financial_transactions(costCenter);
  CREATE INDEX IF NOT EXISTS idx_financial_transactions_source ON financial_transactions(sourceType, sourceId);
  CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
  CREATE INDEX IF NOT EXISTS idx_financial_transactions_occurred_at ON financial_transactions(occurredAt);
  CREATE INDEX IF NOT EXISTS idx_ambulance_fuel_logs_ambulance ON ambulance_fuel_logs(ambulanceId);
  CREATE INDEX IF NOT EXISTS idx_ambulance_fuel_logs_fueled_at ON ambulance_fuel_logs(fueledAt);

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

  -- Coduri de acces 4 cifre pentru medici (login fără email/parolă)
  CREATE TABLE IF NOT EXISTS doctor_access_codes (
    code TEXT PRIMARY KEY CHECK(length(code) = 4 AND code GLOB '[0-9][0-9][0-9][0-9]'),
    doctor_name TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_doctor_access_codes_doctor_name ON doctor_access_codes(doctor_name);

  -- Raportări probleme către administrator (doar pacienți, vizibile doar admin)
  CREATE TABLE IF NOT EXISTS problem_reports (
    id TEXT PRIMARY KEY,
    userId TEXT,
    reporterName TEXT NOT NULL,
    reporterEmail TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','in_progress','resolved')),
    adminNotes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_problem_reports_userId ON problem_reports(userId);
  CREATE INDEX IF NOT EXISTS idx_problem_reports_status ON problem_reports(status);
  CREATE INDEX IF NOT EXISTS idx_problem_reports_createdAt ON problem_reports(createdAt);

  -- Semnături digitale pacienți (canvas → base64 PNG)
  CREATE TABLE IF NOT EXISTS patient_signatures (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    documentType TEXT NOT NULL,
    documentId TEXT,
    signatureData TEXT NOT NULL,
    signedAt TEXT NOT NULL DEFAULT (datetime('now')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );
  CREATE INDEX IF NOT EXISTS idx_patient_signatures_patientId ON patient_signatures(patientId);
  CREATE INDEX IF NOT EXISTS idx_patient_signatures_documentType ON patient_signatures(documentType);
  CREATE INDEX IF NOT EXISTS idx_patient_signatures_signedAt ON patient_signatures(signedAt);

  -- Operațiuni zilnice și logistică
  CREATE TABLE IF NOT EXISTS consumable_requests (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    requestedBy TEXT NOT NULL,
    itemsJson TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','fulfilled','cancelled')),
    notes TEXT,
    fulfilledAt TEXT,
    fulfilledBy TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_consumable_requests_department ON consumable_requests(department);
  CREATE INDEX IF NOT EXISTS idx_consumable_requests_status ON consumable_requests(status);
  CREATE INDEX IF NOT EXISTS idx_consumable_requests_createdAt ON consumable_requests(createdAt);

  CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    locationType TEXT NOT NULL,
    locationId TEXT,
    serialNumber TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','in_use','maintenance','out_of_service')),
    notes TEXT,
    lastMaintenanceAt TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(locationType, locationId);
  CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);

  CREATE TABLE IF NOT EXISTS internal_transport_requests (
    id TEXT PRIMARY KEY,
    patientName TEXT NOT NULL,
    patientId TEXT,
    fromLocation TEXT NOT NULL,
    toLocation TEXT NOT NULL,
    transportType TEXT NOT NULL DEFAULT 'wheelchair' CHECK(transportType IN ('wheelchair','stretcher','bed','ambulance_internal')),
    requestedBy TEXT NOT NULL,
    scheduledAt TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','scheduled','in_progress','completed','cancelled')),
    completedAt TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patientId) REFERENCES patients(id)
  );
  CREATE INDEX IF NOT EXISTS idx_internal_transport_status ON internal_transport_requests(status);
  CREATE INDEX IF NOT EXISTS idx_internal_transport_createdAt ON internal_transport_requests(createdAt);
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

// Inițializare tipuri analize laborator (inclusiv TDM - monitorizare terapie)
try {
  const labTestCount = db.prepare("SELECT COUNT(*) as count FROM lab_test_types").get() as { count: number } | undefined;
  if (labTestCount && labTestCount.count === 0) {
    const now = new Date().toISOString();
    const testTypes = [
      { id: "lt-hemo", code: "HEMO", name: "Hemoleucogramă", category: "blood", unit: "-", referenceRange: null },
      { id: "lt-glucose", code: "GLU", name: "Glicemie", category: "blood", unit: "mg/dL", referenceRange: "70-100" },
      { id: "lt-creat", code: "CREAT", name: "Creatinină", category: "renal", unit: "mg/dL", referenceRange: "0.7-1.2" },
      { id: "lt-urea", code: "UREA", name: "Uree", category: "renal", unit: "mg/dL", referenceRange: "15-40" },
      { id: "lt-alt", code: "ALT", name: "ALAT", category: "hepatic", unit: "U/L", referenceRange: "< 41" },
      { id: "lt-ast", code: "AST", name: "ASAT", category: "hepatic", unit: "U/L", referenceRange: "< 40" },
      { id: "lt-vanco", code: "VANCO", name: "Vancomicin nivel seric", category: "tdm", unit: "mg/L", referenceRange: "10-20 (trough)" },
      { id: "lt-lithium", code: "LI", name: "Litiu seric", category: "tdm", unit: "mmol/L", referenceRange: "0.6-1.2" },
      { id: "lt-digoxin", code: "DIG", name: "Digoxin nivel seric", category: "tdm", unit: "ng/mL", referenceRange: "0.5-2" },
      { id: "lt-phenytoin", code: "PHT", name: "Fenitoină nivel seric", category: "tdm", unit: "mg/L", referenceRange: "10-20" },
    ];
    testTypes.forEach((t) => {
      db.prepare(`
        INSERT INTO lab_test_types (id, code, name, category, unit, referenceRange, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(t.id, t.code, t.name, t.category, t.unit, t.referenceRange, now);
    });
  }
} catch (e) {
  console.error("Error initializing lab_test_types:", e);
}

// Inițializare modalități imagistice
try {
  const imagingCount = db.prepare("SELECT COUNT(*) as count FROM imaging_modalities").get() as { count: number };
  if (imagingCount.count === 0) {
    const modalities = [
      { id: "img-rmn", name: "RMN", slotDurationMinutes: 45, description: "Rezonanță magnetică nucleară" },
      { id: "img-ct", name: "CT", slotDurationMinutes: 30, description: "Tomografie computerizată" },
      { id: "img-eco", name: "Ecografie", slotDurationMinutes: 20, description: "Ecografie medicală" },
      { id: "img-rad", name: "Radiologie", slotDurationMinutes: 15, description: "Radiografie / radioscopie" },
      { id: "img-mamo", name: "Mamografie", slotDurationMinutes: 25, description: "Mamografie" },
    ];
    const now = new Date().toISOString();
    modalities.forEach((m) => {
      db.prepare(`
        INSERT INTO imaging_modalities (id, name, slotDurationMinutes, description, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 1, ?, ?)
      `).run(m.id, m.name, m.slotDurationMinutes, m.description || null, now, now);
    });
  }
} catch (error) {
  console.error("Error initializing imaging modalities:", error);
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

// Inițializare consum combustibil pentru ambulanțe + exemple financiare operaționale
try {
  const fuelCount = db.prepare("SELECT COUNT(*) as count FROM ambulance_fuel_logs").get() as { count: number };
  if (fuelCount.count === 0) {
    const ambulances = db.prepare("SELECT id, ambulanceNumber FROM ambulances ORDER BY ambulanceNumber LIMIT 2").all() as Array<{ id: string; ambulanceNumber: string }>;
    const now = new Date();
    ambulances.forEach((ambulance, index) => {
      const logId = randomUUID();
      const liters = index === 0 ? 68 : 54;
      const costPerLiter = 7.42;
      const totalCost = Number((liters * costPerLiter).toFixed(2));
      const fueledAt = new Date(now.getTime() - (index + 1) * 24 * 60 * 60 * 1000).toISOString();
      db.prepare(`
        INSERT INTO ambulance_fuel_logs (
          id, ambulanceId, liters, costPerLiter, totalCost, odometerKm,
          fueledAt, stationName, fueledBy, notes, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        ambulance.id,
        liters,
        costPerLiter,
        totalCost,
        index === 0 ? 124380 : 119240,
        fueledAt,
        index === 0 ? "OMV Splai Independenței" : "Petrom Berceni",
        index === 0 ? "Coordonator parc auto" : "Șef tură dispecerat",
        `Alimentare preventivă pentru ${ambulance.ambulanceNumber}.`,
        fueledAt,
        fueledAt
      );

      db.prepare(`
        INSERT INTO financial_transactions (
          id, transactionType, category, costCenter, sourceType, sourceId, amount,
          taxAmount, deductibleAmount, currency, status, description, occurredAt,
          createdBy, notes, metadata, createdAt, updatedAt
        ) VALUES (?, 'expense', 'ambulance_fuel', 'ambulance', 'ambulance_fuel_log', ?, ?, 0, 0, 'RON', 'paid', ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        logId,
        totalCost,
        `Combustibil pentru ${ambulance.ambulanceNumber}`,
        fueledAt,
        index === 0 ? "Coordonator parc auto" : "Șef tură dispecerat",
        "Cheltuială operațională introdusă automat pentru demo.",
        JSON.stringify({ ambulanceId: ambulance.id, liters, costPerLiter }),
        fueledAt,
        fueledAt
      );
    });

    db.prepare(`
      INSERT INTO financial_transactions (
        id, transactionType, category, costCenter, amount, taxAmount, deductibleAmount,
        currency, status, description, occurredAt, createdBy, notes, metadata, createdAt, updatedAt
      ) VALUES (?, 'expense', 'utilities', 'general', ?, 0, 0, 'RON', 'approved', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      18450,
      "Factură energie și climatizare bloc operator / imagistică",
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      "Administrator financiar",
      "Cheltuială operațională lunară introdusă pentru demonstrarea centrului de cost general.",
      JSON.stringify({ provider: "Electrica Furnizare", period: "aprilie 2026" }),
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    );
  }
} catch (error) {
  console.error("Error initializing finance demo data:", error);
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

// Inițializare săli spitalizare normale (pe secții)
try {
  const hospitalRoomsExist = db.prepare("SELECT COUNT(*) as count FROM hospital_rooms").get() as { count: number };
  if (hospitalRoomsExist.count === 0) {
    const departments = ['cardiology', 'surgery', 'pediatrics', 'orthopedics', 'neurology', 'general'];
    const roomTypes = ['standard', 'private', 'semi_private'];
    const rooms: string[] = [];
    
    departments.forEach((dept, deptIdx) => {
      const floor = Math.floor(deptIdx / 2) + 1;
      [1, 2, 3].forEach((roomNum) => {
        const roomId = randomUUID();
        const roomType = roomTypes[roomNum % 3];
        const capacity = roomType === 'private' ? 1 : roomType === 'semi_private' ? 2 : 3;
        rooms.push(`('${roomId}', '${dept.charAt(0).toUpperCase() + dept.slice(1)}-${roomNum}', ${floor}, '${dept}', '${roomType}', ${capacity}, 0, 1)`);
      });
    });
    
    if (rooms.length > 0) {
      db.exec(`
        INSERT INTO hospital_rooms (id, roomNumber, floor, department, roomType, maxCapacity, currentOccupancy, isAvailable) VALUES
        ${rooms.join(',\n        ')};
      `);
    }
  }
} catch (error) {
  console.log("Hospital rooms initialization:", error);
}

// Inițializare săli bloc operator
try {
  const operatingRoomsExist = db.prepare("SELECT COUNT(*) as count FROM operating_rooms").get() as { count: number };
  if (operatingRoomsExist.count === 0) {
    const now = new Date().toISOString();
    const rooms = [
      {
        id: randomUUID(),
        roomNumber: "BO-1",
        specialty: "Chirurgie generală",
        floor: 2,
        status: "available",
        hasAnesthesiaMachine: 1,
        hasImagingSupport: 0,
        notes: "Sală pentru chirurgie abdominală și intervenții elective.",
      },
      {
        id: randomUUID(),
        roomNumber: "BO-2",
        specialty: "Ortopedie și traumatologie",
        floor: 2,
        status: "available",
        hasAnesthesiaMachine: 1,
        hasImagingSupport: 1,
        notes: "Sală cu suport pentru C-arm și materiale ortopedice.",
      },
      {
        id: randomUUID(),
        roomNumber: "BO-3",
        specialty: "Neurochirurgie / chirurgie vasculară",
        floor: 3,
        status: "cleaning",
        hasAnesthesiaMachine: 1,
        hasImagingSupport: 1,
        notes: "Sală hibridă pentru cazuri complexe și prioritare.",
      },
    ];

    rooms.forEach((room) => {
      db.prepare(`
        INSERT INTO operating_rooms (
          id, roomNumber, specialty, floor, status,
          hasAnesthesiaMachine, hasImagingSupport, notes, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        room.id,
        room.roomNumber,
        room.specialty,
        room.floor,
        room.status,
        room.hasAnesthesiaMachine,
        room.hasImagingSupport,
        room.notes,
        now,
        now
      );
    });
  }
} catch (error) {
  console.log("Operating rooms initialization:", error);
}

export default db;
