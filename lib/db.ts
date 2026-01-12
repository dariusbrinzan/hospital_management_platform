import Database from "better-sqlite3";
import { join } from "path";
import { mkdir } from "fs/promises";

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
`);

export default db;
