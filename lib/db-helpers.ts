import { randomUUID } from "crypto";
import db from "./db";

// Helper pentru a genera ID-uri unice
export const generateId = () => randomUUID();

// Helper pentru a formata datele pentru SQLite
export const formatDate = (date: Date | string): string => {
  return new Date(date).toISOString();
};

// Helper pentru a parse datele din SQLite
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

// Users helpers
export const userHelpers = {
  create: async (user: { name: string; email: string; password: string }) => {
    const bcrypt = await import("bcryptjs");
    const id = generateId();
    const now = new Date().toISOString();
    
    // Hash-uiește parola
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    db.prepare(`
      INSERT INTO users (id, name, email, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, user.name, user.email, hashedPassword, now, now);

    return { $id: id, name: user.name, email: user.email, createdAt: now, updatedAt: now };
  },

  getById: (id: string) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    if (!user) return null;
    return { $id: user.id, name: user.name, email: user.email, password: user.password, createdAt: user.createdAt, updatedAt: user.updatedAt };
  },

  getByEmail: (email: string) => {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) return null;
    return { $id: user.id, name: user.name, email: user.email, password: user.password, createdAt: user.createdAt, updatedAt: user.updatedAt };
  },
};

// Patients helpers
export const patientHelpers = {
  create: (patient: any) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO patients (
        id, userId, name, email, phone, birthDate, gender, address, occupation,
        emergencyContactName, emergencyContactNumber, primaryPhysician,
        insuranceProvider, insurancePolicyNumber, allergies, currentMedication,
        familyMedicalHistory, pastMedicalHistory, identificationType,
        identificationNumber, identificationDocumentId, identificationDocumentUrl,
        privacyConsent, bloodType, height, weight, cardiovascularDiseases,
        chronicDiseases, surgeries, vaccinations, smokingStatus,
        alcoholConsumption, exerciseFrequency, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      patient.userId,
      patient.name,
      patient.email,
      patient.phone,
      formatDate(patient.birthDate),
      patient.gender,
      patient.address,
      patient.occupation,
      patient.emergencyContactName,
      patient.emergencyContactNumber,
      patient.primaryPhysician,
      patient.insuranceProvider,
      patient.insurancePolicyNumber,
      patient.allergies || null,
      patient.currentMedication || null,
      patient.familyMedicalHistory || null,
      patient.pastMedicalHistory || null,
      patient.identificationType || null,
      patient.identificationNumber || null,
      patient.identificationDocumentId || null,
      patient.identificationDocumentUrl || null,
      patient.privacyConsent ? 1 : 0,
      patient.bloodType || null,
      patient.height || null,
      patient.weight || null,
      patient.cardiovascularDiseases || null,
      patient.chronicDiseases || null,
      patient.surgeries || null,
      patient.vaccinations || null,
      patient.smokingStatus || null,
      patient.alcoholConsumption || null,
      patient.exerciseFrequency || null,
      now,
      now
    );

    return { $id: id, ...patient, createdAt: now, updatedAt: now };
  },

  getByUserId: (userId: string) => {
    const patient = db.prepare("SELECT * FROM patients WHERE userId = ?").get(userId) as any;
    if (!patient) return null;
    return {
      $id: patient.id,
      userId: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      address: patient.address,
      occupation: patient.occupation,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactNumber: patient.emergencyContactNumber,
      primaryPhysician: patient.primaryPhysician,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      allergies: patient.allergies,
      currentMedication: patient.currentMedication,
      familyMedicalHistory: patient.familyMedicalHistory,
      pastMedicalHistory: patient.pastMedicalHistory,
      identificationType: patient.identificationType,
      identificationNumber: patient.identificationNumber,
      identificationDocumentId: patient.identificationDocumentId,
      identificationDocumentUrl: patient.identificationDocumentUrl,
      privacyConsent: patient.privacyConsent === 1,
      bloodType: patient.bloodType,
      height: patient.height,
      weight: patient.weight,
      cardiovascularDiseases: patient.cardiovascularDiseases,
      chronicDiseases: patient.chronicDiseases,
      surgeries: patient.surgeries,
      vaccinations: patient.vaccinations,
      smokingStatus: patient.smokingStatus,
      alcoholConsumption: patient.alcoholConsumption,
      exerciseFrequency: patient.exerciseFrequency,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  },

  getById: (id: string) => {
    const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id) as any;
    if (!patient) return null;
    return {
      $id: patient.id,
      userId: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      address: patient.address,
      occupation: patient.occupation,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactNumber: patient.emergencyContactNumber,
      primaryPhysician: patient.primaryPhysician,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      allergies: patient.allergies,
      currentMedication: patient.currentMedication,
      familyMedicalHistory: patient.familyMedicalHistory,
      pastMedicalHistory: patient.pastMedicalHistory,
      identificationType: patient.identificationType,
      identificationNumber: patient.identificationNumber,
      identificationDocumentId: patient.identificationDocumentId,
      identificationDocumentUrl: patient.identificationDocumentUrl,
      privacyConsent: patient.privacyConsent === 1,
      bloodType: patient.bloodType,
      height: patient.height,
      weight: patient.weight,
      cardiovascularDiseases: patient.cardiovascularDiseases,
      chronicDiseases: patient.chronicDiseases,
      surgeries: patient.surgeries,
      vaccinations: patient.vaccinations,
      smokingStatus: patient.smokingStatus,
      alcoholConsumption: patient.alcoholConsumption,
      exerciseFrequency: patient.exerciseFrequency,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  },

  // Căutare pacienți pentru admin
  search: (query: string) => {
    const searchTerm = `%${query.toLowerCase()}%`;
    const patients = db.prepare(`
      SELECT * FROM patients 
      WHERE 
        LOWER(name) LIKE ? OR 
        LOWER(email) LIKE ? OR 
        LOWER(phone) LIKE ? OR
        LOWER(identificationNumber) LIKE ?
      ORDER BY name ASC
      LIMIT 50
    `).all(searchTerm, searchTerm, searchTerm, searchTerm) as any[];

    return patients.map((patient) => ({
      $id: patient.id,
      userId: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      address: patient.address,
      occupation: patient.occupation,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactNumber: patient.emergencyContactNumber,
      primaryPhysician: patient.primaryPhysician,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      allergies: patient.allergies,
      currentMedication: patient.currentMedication,
      familyMedicalHistory: patient.familyMedicalHistory,
      pastMedicalHistory: patient.pastMedicalHistory,
      identificationType: patient.identificationType,
      identificationNumber: patient.identificationNumber,
      identificationDocumentId: patient.identificationDocumentId,
      identificationDocumentUrl: patient.identificationDocumentUrl,
      privacyConsent: patient.privacyConsent === 1,
      bloodType: patient.bloodType,
      height: patient.height,
      weight: patient.weight,
      cardiovascularDiseases: patient.cardiovascularDiseases,
      chronicDiseases: patient.chronicDiseases,
      surgeries: patient.surgeries,
      vaccinations: patient.vaccinations,
      smokingStatus: patient.smokingStatus,
      alcoholConsumption: patient.alcoholConsumption,
      exerciseFrequency: patient.exerciseFrequency,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));
  },

  // Obține toți pacienții
  getAll: () => {
    const patients = db.prepare(`
      SELECT * FROM patients 
      ORDER BY name ASC
    `).all() as any[];

    return patients.map((patient) => ({
      $id: patient.id,
      userId: patient.userId,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      address: patient.address,
      occupation: patient.occupation,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactNumber: patient.emergencyContactNumber,
      primaryPhysician: patient.primaryPhysician,
      insuranceProvider: patient.insuranceProvider,
      insurancePolicyNumber: patient.insurancePolicyNumber,
      allergies: patient.allergies,
      currentMedication: patient.currentMedication,
      familyMedicalHistory: patient.familyMedicalHistory,
      pastMedicalHistory: patient.pastMedicalHistory,
      identificationType: patient.identificationType,
      identificationNumber: patient.identificationNumber,
      identificationDocumentId: patient.identificationDocumentId,
      identificationDocumentUrl: patient.identificationDocumentUrl,
      privacyConsent: patient.privacyConsent === 1,
      bloodType: patient.bloodType,
      height: patient.height,
      weight: patient.weight,
      cardiovascularDiseases: patient.cardiovascularDiseases,
      chronicDiseases: patient.chronicDiseases,
      surgeries: patient.surgeries,
      vaccinations: patient.vaccinations,
      smokingStatus: patient.smokingStatus,
      alcoholConsumption: patient.alcoholConsumption,
      exerciseFrequency: patient.exerciseFrequency,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    }));
  },

  update: (id: string, data: Record<string, any>) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data);
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const v = data[f];
      if (v instanceof Date) return v.toISOString();
      if (v === undefined) return null;
      return v;
    });

    db.prepare(`
      UPDATE patients SET ${setClause}, updatedAt = ? WHERE id = ?
    `).run(...values, now, id);

    return patientHelpers.getById(id);
  },
};

// Appointments helpers
export const appointmentHelpers = {
  create: (appointment: any) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO appointments (
        id, userId, patientId, schedule, status, primaryPhysician,
        reason, note, cancellationReason, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      appointment.userId,
      appointment.patient,
      formatDate(appointment.schedule),
      appointment.status,
      appointment.primaryPhysician,
      appointment.reason,
      appointment.note || null,
      null,
      now,
      now
    );

    return { $id: id, ...appointment, createdAt: now, updatedAt: now };
  },

  getAll: () => {
    const appointments = db.prepare(`
      SELECT 
        a.*,
        p.id as patient_id,
        p.name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.birthDate as patient_birthDate,
        p.gender as patient_gender,
        p.address as patient_address,
        p.occupation as patient_occupation,
        p.emergencyContactName as patient_emergencyContactName,
        p.emergencyContactNumber as patient_emergencyContactNumber,
        p.primaryPhysician as patient_primaryPhysician,
        p.insuranceProvider as patient_insuranceProvider,
        p.insurancePolicyNumber as patient_insurancePolicyNumber,
        p.allergies as patient_allergies,
        p.currentMedication as patient_currentMedication,
        p.familyMedicalHistory as patient_familyMedicalHistory,
        p.pastMedicalHistory as patient_pastMedicalHistory,
        p.identificationType as patient_identificationType,
        p.identificationNumber as patient_identificationNumber,
        p.identificationDocumentId as patient_identificationDocumentId,
        p.identificationDocumentUrl as patient_identificationDocumentUrl,
        p.privacyConsent as patient_privacyConsent,
        p.bloodType as patient_bloodType,
        p.height as patient_height,
        p.weight as patient_weight,
        p.cardiovascularDiseases as patient_cardiovascularDiseases,
        p.chronicDiseases as patient_chronicDiseases,
        p.surgeries as patient_surgeries,
        p.vaccinations as patient_vaccinations,
        p.smokingStatus as patient_smokingStatus,
        p.alcoholConsumption as patient_alcoholConsumption,
        p.exerciseFrequency as patient_exerciseFrequency,
        p.createdAt as patient_createdAt,
        p.updatedAt as patient_updatedAt
      FROM appointments a
      JOIN patients p ON a.patientId = p.id
      ORDER BY a.createdAt DESC
    `).all() as any[];

    return appointments.map(apt => ({
      $id: apt.id,
      userId: apt.userId,
      schedule: parseDate(apt.schedule),
      status: apt.status,
      primaryPhysician: apt.primaryPhysician,
      reason: apt.reason,
      note: apt.note,
      cancellationReason: apt.cancellationReason,
      analysisResults: apt.analysisResults,
      createdAt: parseDate(apt.createdAt),
      updatedAt: parseDate(apt.updatedAt),
      patient: {
        $id: apt.patient_id,
        userId: apt.userId,
        name: apt.patient_name,
        email: apt.patient_email,
        phone: apt.patient_phone,
        birthDate: parseDate(apt.patient_birthDate),
        gender: apt.patient_gender,
        address: apt.patient_address,
        occupation: apt.patient_occupation,
        emergencyContactName: apt.patient_emergencyContactName,
        emergencyContactNumber: apt.patient_emergencyContactNumber,
        primaryPhysician: apt.patient_primaryPhysician,
        insuranceProvider: apt.patient_insuranceProvider,
        insurancePolicyNumber: apt.patient_insurancePolicyNumber,
        allergies: apt.patient_allergies,
        currentMedication: apt.patient_currentMedication,
        familyMedicalHistory: apt.patient_familyMedicalHistory,
        pastMedicalHistory: apt.patient_pastMedicalHistory,
        identificationType: apt.patient_identificationType,
        identificationNumber: apt.patient_identificationNumber,
        identificationDocumentId: apt.patient_identificationDocumentId,
        identificationDocumentUrl: apt.patient_identificationDocumentUrl,
        privacyConsent: apt.patient_privacyConsent === 1,
        bloodType: apt.patient_bloodType,
        height: apt.patient_height,
        weight: apt.patient_weight,
        cardiovascularDiseases: apt.patient_cardiovascularDiseases,
        chronicDiseases: apt.patient_chronicDiseases,
        surgeries: apt.patient_surgeries,
        vaccinations: apt.patient_vaccinations,
        smokingStatus: apt.patient_smokingStatus,
        alcoholConsumption: apt.patient_alcoholConsumption,
        exerciseFrequency: apt.patient_exerciseFrequency,
        createdAt: parseDate(apt.patient_createdAt),
        updatedAt: parseDate(apt.patient_updatedAt),
      },
    }));
  },

  getByUserId: (userId: string) => {
    const appointments = db.prepare(`
      SELECT 
        a.*,
        p.id as patient_id,
        p.name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.birthDate as patient_birthDate,
        p.gender as patient_gender,
        p.address as patient_address,
        p.occupation as patient_occupation,
        p.emergencyContactName as patient_emergencyContactName,
        p.emergencyContactNumber as patient_emergencyContactNumber,
        p.primaryPhysician as patient_primaryPhysician,
        p.insuranceProvider as patient_insuranceProvider,
        p.insurancePolicyNumber as patient_insurancePolicyNumber,
        p.allergies as patient_allergies,
        p.currentMedication as patient_currentMedication,
        p.familyMedicalHistory as patient_familyMedicalHistory,
        p.pastMedicalHistory as patient_pastMedicalHistory,
        p.identificationType as patient_identificationType,
        p.identificationNumber as patient_identificationNumber,
        p.identificationDocumentId as patient_identificationDocumentId,
        p.identificationDocumentUrl as patient_identificationDocumentUrl,
        p.privacyConsent as patient_privacyConsent,
        p.bloodType as patient_bloodType,
        p.height as patient_height,
        p.weight as patient_weight,
        p.cardiovascularDiseases as patient_cardiovascularDiseases,
        p.chronicDiseases as patient_chronicDiseases,
        p.surgeries as patient_surgeries,
        p.vaccinations as patient_vaccinations,
        p.smokingStatus as patient_smokingStatus,
        p.alcoholConsumption as patient_alcoholConsumption,
        p.exerciseFrequency as patient_exerciseFrequency,
        p.createdAt as patient_createdAt,
        p.updatedAt as patient_updatedAt
      FROM appointments a
      JOIN patients p ON a.patientId = p.id
      WHERE a.userId = ?
      ORDER BY a.schedule DESC
    `).all(userId) as any[];

    return appointments.map(apt => ({
      $id: apt.id,
      userId: apt.userId,
      schedule: parseDate(apt.schedule),
      status: apt.status,
      primaryPhysician: apt.primaryPhysician,
      reason: apt.reason,
      note: apt.note,
      cancellationReason: apt.cancellationReason,
      analysisResults: apt.analysisResults,
      createdAt: parseDate(apt.createdAt),
      updatedAt: parseDate(apt.updatedAt),
      patient: {
        $id: apt.patient_id,
        userId: apt.userId,
        name: apt.patient_name,
        email: apt.patient_email,
        phone: apt.patient_phone,
        birthDate: parseDate(apt.patient_birthDate),
        gender: apt.patient_gender,
        address: apt.patient_address,
        occupation: apt.patient_occupation,
        emergencyContactName: apt.patient_emergencyContactName,
        emergencyContactNumber: apt.patient_emergencyContactNumber,
        primaryPhysician: apt.patient_primaryPhysician,
        insuranceProvider: apt.patient_insuranceProvider,
        insurancePolicyNumber: apt.patient_insurancePolicyNumber,
        allergies: apt.patient_allergies,
        currentMedication: apt.patient_currentMedication,
        familyMedicalHistory: apt.patient_familyMedicalHistory,
        pastMedicalHistory: apt.patient_pastMedicalHistory,
        identificationType: apt.patient_identificationType,
        identificationNumber: apt.patient_identificationNumber,
        identificationDocumentId: apt.patient_identificationDocumentId,
        identificationDocumentUrl: apt.patient_identificationDocumentUrl,
        privacyConsent: apt.patient_privacyConsent === 1,
        bloodType: apt.patient_bloodType,
        height: apt.patient_height,
        weight: apt.patient_weight,
        cardiovascularDiseases: apt.patient_cardiovascularDiseases,
        chronicDiseases: apt.patient_chronicDiseases,
        surgeries: apt.patient_surgeries,
        vaccinations: apt.patient_vaccinations,
        smokingStatus: apt.patient_smokingStatus,
        alcoholConsumption: apt.patient_alcoholConsumption,
        exerciseFrequency: apt.patient_exerciseFrequency,
        createdAt: parseDate(apt.patient_createdAt),
        updatedAt: parseDate(apt.patient_updatedAt),
      },
    }));
  },

  getById: (id: string) => {
    const apt = db.prepare(`
      SELECT 
        a.*,
        p.id as patient_id,
        p.name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.birthDate as patient_birthDate,
        p.gender as patient_gender,
        p.address as patient_address,
        p.occupation as patient_occupation,
        p.emergencyContactName as patient_emergencyContactName,
        p.emergencyContactNumber as patient_emergencyContactNumber,
        p.primaryPhysician as patient_primaryPhysician,
        p.insuranceProvider as patient_insuranceProvider,
        p.insurancePolicyNumber as patient_insurancePolicyNumber,
        p.allergies as patient_allergies,
        p.currentMedication as patient_currentMedication,
        p.familyMedicalHistory as patient_familyMedicalHistory,
        p.pastMedicalHistory as patient_pastMedicalHistory,
        p.identificationType as patient_identificationType,
        p.identificationNumber as patient_identificationNumber,
        p.identificationDocumentId as patient_identificationDocumentId,
        p.identificationDocumentUrl as patient_identificationDocumentUrl,
        p.privacyConsent as patient_privacyConsent,
        p.bloodType as patient_bloodType,
        p.height as patient_height,
        p.weight as patient_weight,
        p.cardiovascularDiseases as patient_cardiovascularDiseases,
        p.chronicDiseases as patient_chronicDiseases,
        p.surgeries as patient_surgeries,
        p.vaccinations as patient_vaccinations,
        p.smokingStatus as patient_smokingStatus,
        p.alcoholConsumption as patient_alcoholConsumption,
        p.exerciseFrequency as patient_exerciseFrequency,
        p.createdAt as patient_createdAt,
        p.updatedAt as patient_updatedAt
      FROM appointments a
      JOIN patients p ON a.patientId = p.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!apt) return null;

    return {
      $id: apt.id,
      userId: apt.userId,
      schedule: parseDate(apt.schedule),
      status: apt.status,
      primaryPhysician: apt.primaryPhysician,
      reason: apt.reason,
      note: apt.note,
      cancellationReason: apt.cancellationReason,
      createdAt: parseDate(apt.createdAt),
      updatedAt: parseDate(apt.updatedAt),
      patient: {
        $id: apt.patient_id,
        userId: apt.userId,
        name: apt.patient_name,
        email: apt.patient_email,
        phone: apt.patient_phone,
        birthDate: parseDate(apt.patient_birthDate),
        gender: apt.patient_gender,
        address: apt.patient_address,
        occupation: apt.patient_occupation,
        emergencyContactName: apt.patient_emergencyContactName,
        emergencyContactNumber: apt.patient_emergencyContactNumber,
        primaryPhysician: apt.patient_primaryPhysician,
        insuranceProvider: apt.patient_insuranceProvider,
        insurancePolicyNumber: apt.patient_insurancePolicyNumber,
        allergies: apt.patient_allergies,
        currentMedication: apt.patient_currentMedication,
        familyMedicalHistory: apt.patient_familyMedicalHistory,
        pastMedicalHistory: apt.patient_pastMedicalHistory,
        identificationType: apt.patient_identificationType,
        identificationNumber: apt.patient_identificationNumber,
        identificationDocumentId: apt.patient_identificationDocumentId,
        identificationDocumentUrl: apt.patient_identificationDocumentUrl,
        privacyConsent: apt.patient_privacyConsent === 1,
        bloodType: apt.patient_bloodType,
        height: apt.patient_height,
        weight: apt.patient_weight,
        cardiovascularDiseases: apt.patient_cardiovascularDiseases,
        chronicDiseases: apt.patient_chronicDiseases,
        surgeries: apt.patient_surgeries,
        vaccinations: apt.patient_vaccinations,
        smokingStatus: apt.patient_smokingStatus,
        alcoholConsumption: apt.patient_alcoholConsumption,
        exerciseFrequency: apt.patient_exerciseFrequency,
        createdAt: parseDate(apt.patient_createdAt),
        updatedAt: parseDate(apt.patient_updatedAt),
      },
    };
  },

  update: (id: string, updates: any) => {
    const now = new Date().toISOString();
    
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }
    if (updates.schedule !== undefined) {
      fields.push("schedule = ?");
      values.push(formatDate(updates.schedule));
    }
    if (updates.primaryPhysician !== undefined) {
      fields.push("primaryPhysician = ?");
      values.push(updates.primaryPhysician);
    }
    if (updates.reason !== undefined) {
      fields.push("reason = ?");
      values.push(updates.reason);
    }
    if (updates.note !== undefined) {
      fields.push("note = ?");
      values.push(updates.note);
    }
    if (updates.cancellationReason !== undefined) {
      fields.push("cancellationReason = ?");
      values.push(updates.cancellationReason);
    }
    if (updates.analysisResults !== undefined) {
      fields.push("analysisResults = ?");
      values.push(updates.analysisResults);
    }

    fields.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    if (fields.length > 1) {
      db.prepare(`UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    return appointmentHelpers.getById(id);
  },
};

// Notifications helpers
export const notificationHelpers = {
  create: (notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    appointmentId?: string | null;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO notifications (id, userId, type, title, message, appointmentId, isRead, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id,
      notification.userId,
      notification.type,
      notification.title,
      notification.message,
      notification.appointmentId || null,
      now
    );

    return {
      $id: id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      appointmentId: notification.appointmentId || null,
      isRead: false,
      createdAt: parseDate(now),
    };
  },

  getByUserId: (userId: string, limit?: number) => {
    const query = limit
      ? `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`
      : `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC`;
    
    const notifications = (limit
      ? db.prepare(query).all(userId, limit)
      : db.prepare(query).all(userId)) as any[];

    return notifications.map((notif) => ({
      $id: notif.id,
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      appointmentId: notif.appointmentId,
      isRead: notif.isRead === 1,
      createdAt: parseDate(notif.createdAt),
    }));
  },

  getUnreadCount: (userId: string) => {
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0
    `).get(userId) as { count: number };
    
    return result.count;
  },

  markAsRead: (notificationId: string) => {
    db.prepare(`UPDATE notifications SET isRead = 1 WHERE id = ?`).run(notificationId);
    return notificationHelpers.getById(notificationId);
  },

  markAllAsRead: (userId: string) => {
    db.prepare(`UPDATE notifications SET isRead = 1 WHERE userId = ? AND isRead = 0`).run(userId);
  },

  getById: (id: string) => {
    const notif = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id) as any;
    if (!notif) return null;
    
    return {
      $id: notif.id,
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      appointmentId: notif.appointmentId,
      isRead: notif.isRead === 1,
      createdAt: parseDate(notif.createdAt),
    };
  },
};

// Waitlist helpers (listă de așteptare pentru sloturi)
export const waitlistHelpers = {
  create: (entry: {
    userId: string;
    patientId: string;
    primaryPhysician: string;
    requestedSlotAt: string;
    reason?: string | null;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO appointment_waitlist (id, userId, patientId, primaryPhysician, requestedSlotAt, reason, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(id, entry.userId, entry.patientId, entry.primaryPhysician, entry.requestedSlotAt, entry.reason || null, now);
    return {
      $id: id,
      userId: entry.userId,
      patientId: entry.patientId,
      primaryPhysician: entry.primaryPhysician,
      requestedSlotAt: entry.requestedSlotAt,
      reason: entry.reason || null,
      status: "pending",
      assignedAppointmentId: null,
      createdAt: parseDate(now),
    };
  },

  getByPhysicianAndSlot: (primaryPhysician: string, requestedSlotAt: string) => {
    const rows = db.prepare(`
      SELECT * FROM appointment_waitlist
      WHERE primaryPhysician = ? AND requestedSlotAt = ? AND status = 'pending'
      ORDER BY createdAt ASC
    `).all(primaryPhysician, requestedSlotAt) as any[];
    return rows.map((r) => ({
      $id: r.id,
      userId: r.userId,
      patientId: r.patientId,
      primaryPhysician: r.primaryPhysician,
      requestedSlotAt: r.requestedSlotAt,
      reason: r.reason,
      status: r.status,
      assignedAppointmentId: r.assignedAppointmentId,
      createdAt: parseDate(r.createdAt),
    }));
  },

  markAssigned: (id: string, appointmentId: string) => {
    db.prepare(`UPDATE appointment_waitlist SET status = 'assigned', assignedAppointmentId = ? WHERE id = ?`).run(appointmentId, id);
    return waitlistHelpers.getById(id);
  },

  getById: (id: string) => {
    const r = db.prepare("SELECT * FROM appointment_waitlist WHERE id = ?").get(id) as any;
    if (!r) return null;
    return {
      $id: r.id,
      userId: r.userId,
      patientId: r.patientId,
      primaryPhysician: r.primaryPhysician,
      requestedSlotAt: r.requestedSlotAt,
      reason: r.reason,
      status: r.status,
      assignedAppointmentId: r.assignedAppointmentId,
      createdAt: parseDate(r.createdAt),
    };
  },

  getByUserId: (userId: string) => {
    const rows = db.prepare(`
      SELECT * FROM appointment_waitlist WHERE userId = ? ORDER BY createdAt DESC
    `).all(userId) as any[];
    return rows.map((r) => ({
      $id: r.id,
      userId: r.userId,
      patientId: r.patientId,
      primaryPhysician: r.primaryPhysician,
      requestedSlotAt: r.requestedSlotAt,
      reason: r.reason,
      status: r.status,
      assignedAppointmentId: r.assignedAppointmentId,
      createdAt: parseDate(r.createdAt),
    }));
  },
};

// Imaging modalities helpers
export const imagingModalityHelpers = {
  getAll: () => {
    const rows = db.prepare(`
      SELECT * FROM imaging_modalities WHERE isActive = 1 ORDER BY name
    `).all() as any[];
    return rows.map((r) => ({
      $id: r.id,
      name: r.name,
      slotDurationMinutes: r.slotDurationMinutes,
      description: r.description,
      isActive: r.isActive === 1,
      createdAt: parseDate(r.createdAt),
      updatedAt: parseDate(r.updatedAt),
    }));
  },

  getById: (id: string) => {
    const r = db.prepare("SELECT * FROM imaging_modalities WHERE id = ?").get(id) as any;
    if (!r) return null;
    return {
      $id: r.id,
      name: r.name,
      slotDurationMinutes: r.slotDurationMinutes,
      description: r.description,
      isActive: r.isActive === 1,
      createdAt: parseDate(r.createdAt),
      updatedAt: parseDate(r.updatedAt),
    };
  },
};

// Imaging studies helpers (programări investigații imagistice)
export const imagingStudyHelpers = {
  create: (study: {
    patientId: string;
    modalityId: string;
    scheduledAt: Date | string;
    status?: string;
    sourceType?: string;
    sourceId?: string | null;
    orderedBy?: string | null;
    reason?: string | null;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    const status = study.status || "scheduled";
    const sourceType = study.sourceType || "direct";
    db.prepare(`
      INSERT INTO imaging_studies (id, patientId, modalityId, scheduledAt, status, sourceType, sourceId, orderedBy, reason, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      study.patientId,
      study.modalityId,
      formatDate(study.scheduledAt),
      status,
      sourceType,
      study.sourceId || null,
      study.orderedBy || null,
      study.reason || null,
      now,
      now
    );
    return imagingStudyHelpers.getById(id);
  },

  getById: (id: string) => {
    const s = db.prepare(`
      SELECT s.*, p.name as patient_name, m.name as modality_name
      FROM imaging_studies s
      LEFT JOIN patients p ON s.patientId = p.id
      LEFT JOIN imaging_modalities m ON s.modalityId = m.id
      WHERE s.id = ?
    `).get(id) as any;
    if (!s) return null;
    return {
      $id: s.id,
      patientId: s.patientId,
      modalityId: s.modalityId,
      scheduledAt: parseDate(s.scheduledAt),
      status: s.status,
      sourceType: s.sourceType,
      sourceId: s.sourceId,
      orderedBy: s.orderedBy,
      reason: s.reason,
      resultNotes: s.resultNotes,
      createdAt: parseDate(s.createdAt),
      updatedAt: parseDate(s.updatedAt),
      patientName: s.patient_name,
      modalityName: s.modality_name,
    };
  },

  getByModalityAndDate: (modalityId: string, dateStr: string) => {
    const start = `${dateStr}T00:00:00.000Z`;
    const end = `${dateStr}T23:59:59.999Z`;
    const rows = db.prepare(`
      SELECT s.*, p.name as patient_name
      FROM imaging_studies s
      LEFT JOIN patients p ON s.patientId = p.id
      WHERE s.modalityId = ? AND s.scheduledAt >= ? AND s.scheduledAt <= ? AND s.status != 'cancelled'
      ORDER BY s.scheduledAt
    `).all(modalityId, start, end) as any[];
    return rows.map((s) => ({
      $id: s.id,
      patientId: s.patientId,
      modalityId: s.modalityId,
      scheduledAt: parseDate(s.scheduledAt),
      status: s.status,
      sourceType: s.sourceType,
      sourceId: s.sourceId,
      orderedBy: s.orderedBy,
      reason: s.reason,
      patientName: s.patient_name,
    }));
  },

  getByPatientId: (patientId: string) => {
    const rows = db.prepare(`
      SELECT s.*, m.name as modality_name
      FROM imaging_studies s
      LEFT JOIN imaging_modalities m ON s.modalityId = m.id
      WHERE s.patientId = ? ORDER BY s.scheduledAt DESC
    `).all(patientId) as any[];
    return rows.map((s) => ({
      $id: s.id,
      patientId: s.patientId,
      modalityId: s.modalityId,
      scheduledAt: parseDate(s.scheduledAt),
      status: s.status,
      sourceType: s.sourceType,
      sourceId: s.sourceId,
      orderedBy: s.orderedBy,
      reason: s.reason,
      modalityName: s.modality_name,
    }));
  },

  getBySource: (sourceType: string, sourceId: string) => {
    const rows = db.prepare(`
      SELECT s.*, p.name as patient_name, m.name as modality_name
      FROM imaging_studies s
      LEFT JOIN patients p ON s.patientId = p.id
      LEFT JOIN imaging_modalities m ON s.modalityId = m.id
      WHERE s.sourceType = ? AND s.sourceId = ?
      ORDER BY s.scheduledAt
    `).all(sourceType, sourceId) as any[];
    return rows.map((s) => ({
      $id: s.id,
      patientId: s.patientId,
      modalityId: s.modalityId,
      scheduledAt: parseDate(s.scheduledAt),
      status: s.status,
      sourceType: s.sourceType,
      sourceId: s.sourceId,
      orderedBy: s.orderedBy,
      reason: s.reason,
      patientName: s.patient_name,
      modalityName: s.modality_name,
    }));
  },

  getAllUpcoming: (limit = 50) => {
    const now = new Date().toISOString();
    const rows = db.prepare(`
      SELECT s.*, p.name as patient_name, m.name as modality_name
      FROM imaging_studies s
      LEFT JOIN patients p ON s.patientId = p.id
      LEFT JOIN imaging_modalities m ON s.modalityId = m.id
      WHERE s.scheduledAt >= ? AND s.status != 'cancelled'
      ORDER BY s.scheduledAt ASC
      LIMIT ?
    `).all(now, limit) as any[];
    return rows.map((s) => ({
      $id: s.id,
      patientId: s.patientId,
      modalityId: s.modalityId,
      scheduledAt: parseDate(s.scheduledAt),
      status: s.status,
      sourceType: s.sourceType,
      sourceId: s.sourceId,
      orderedBy: s.orderedBy,
      reason: s.reason,
      patientName: s.patient_name,
      modalityName: s.modality_name,
    }));
  },

  updateStatus: (id: string, status: string, resultNotes?: string | null) => {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE imaging_studies SET status = ?, resultNotes = ?, updatedAt = ? WHERE id = ?
    `).run(status, resultNotes ?? null, now, id);
    return imagingStudyHelpers.getById(id);
  },

  /** Număr de investigații per zi într-un interval (pentru rapoarte). */
  getCountByDayInRange: (startIso: string, endIso: string) => {
    const rows = db.prepare(`
      SELECT date(scheduledAt) as day, COUNT(*) as count
      FROM imaging_studies
      WHERE scheduledAt >= ? AND scheduledAt <= ? AND status != 'cancelled'
      GROUP BY date(scheduledAt)
      ORDER BY day
    `).all(startIso, endIso) as { day: string; count: number }[];
    return rows.map((r) => ({ date: r.day, count: r.count }));
  },
};

// Emergency helpers
export const emergencyHelpers = {
  create: (emergencyCase: {
    patientId?: string | null;
    patientName?: string;
    patientPhone?: string;
    patientAge?: string;
    patientGender?: string;
    triageLevel: "critic" | "urgent" | "normal";
    chiefComplaint: string;
    priority: number;
    vitalSigns?: any;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO emergency_cases (
        id, patientId, patientName, patientPhone, patientAge, patientGender,
        triageLevel, currentState, priority, chiefComplaint,
        vitalSigns, arrivalTime, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'arrival', ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      emergencyCase.patientId || null,
      emergencyCase.patientName || null,
      emergencyCase.patientPhone || null,
      emergencyCase.patientAge || null,
      emergencyCase.patientGender || null,
      emergencyCase.triageLevel,
      emergencyCase.priority,
      emergencyCase.chiefComplaint,
      emergencyCase.vitalSigns ? JSON.stringify(emergencyCase.vitalSigns) : null,
      now,
      now,
      now
    );

    // Creează tranziția inițială
    emergencyHelpers.addStateTransition(id, "arrival", "arrival", "Caz creat", "System");

    return emergencyHelpers.getById(id);
  },

  getAll: () => {
    const cases = db.prepare(`
      SELECT 
        e.*,
        p.id as patient_id,
        p.name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.birthDate as patient_birthDate,
        p.gender as patient_gender
      FROM emergency_cases e
      LEFT JOIN patients p ON e.patientId = p.id
      ORDER BY e.priority ASC, e.arrivalTime DESC
    `).all() as any[];

    return cases.map(c => ({
      $id: c.id,
      patientId: c.patientId,
      patientName: c.patientName,
      patientPhone: c.patientPhone,
      patientAge: c.patientAge,
      patientGender: c.patientGender,
      triageLevel: c.triageLevel,
      currentState: c.currentState,
      assignedDoctorId: c.assignedDoctorId,
      arrivalTime: parseDate(c.arrivalTime),
      triageTime: c.triageTime ? parseDate(c.triageTime) : null,
      admissionTime: c.admissionTime ? parseDate(c.admissionTime) : null,
      dischargeTime: c.dischargeTime ? parseDate(c.dischargeTime) : null,
      priority: c.priority,
      chiefComplaint: c.chiefComplaint,
      vitalSigns: c.vitalSigns ? JSON.parse(c.vitalSigns) : null,
      consentGiven: c.consentGiven === 1,
      carePlan: c.carePlan,
      dischargeLetter: c.dischargeLetter,
      skipReason: c.skipReason,
      createdAt: parseDate(c.createdAt),
      updatedAt: parseDate(c.updatedAt),
      patient: c.patient_id ? {
        $id: c.patient_id,
        name: c.patient_name,
        email: c.patient_email,
        phone: c.patient_phone,
        birthDate: parseDate(c.patient_birthDate),
        gender: c.patient_gender,
      } : null,
    }));
  },

  getById: (id: string) => {
    const c = db.prepare(`
      SELECT 
        e.*,
        p.id as patient_id,
        p.name as patient_name,
        p.email as patient_email,
        p.phone as patient_phone,
        p.birthDate as patient_birthDate,
        p.gender as patient_gender
      FROM emergency_cases e
      LEFT JOIN patients p ON e.patientId = p.id
      WHERE e.id = ?
    `).get(id) as any;

    if (!c) return null;

    return {
      $id: c.id,
      patientId: c.patientId,
      patientName: c.patientName,
      patientPhone: c.patientPhone,
      patientAge: c.patientAge,
      patientGender: c.patientGender,
      triageLevel: c.triageLevel,
      currentState: c.currentState,
      assignedDoctorId: c.assignedDoctorId,
      arrivalTime: parseDate(c.arrivalTime),
      triageTime: c.triageTime ? parseDate(c.triageTime) : null,
      admissionTime: c.admissionTime ? parseDate(c.admissionTime) : null,
      dischargeTime: c.dischargeTime ? parseDate(c.dischargeTime) : null,
      priority: c.priority,
      chiefComplaint: c.chiefComplaint,
      vitalSigns: c.vitalSigns ? JSON.parse(c.vitalSigns) : null,
      consentGiven: c.consentGiven === 1,
      carePlan: c.carePlan,
      dischargeLetter: c.dischargeLetter,
      skipReason: c.skipReason,
      createdAt: parseDate(c.createdAt),
      updatedAt: parseDate(c.updatedAt),
      patient: c.patient_id ? {
        $id: c.patient_id,
        name: c.patient_name,
        email: c.patient_email,
        phone: c.patient_phone,
        birthDate: parseDate(c.patient_birthDate),
        gender: c.patient_gender,
      } : null,
    };
  },

  updateState: (id: string, newState: "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge", performedBy: string, skipReason?: string) => {
    const now = new Date().toISOString();
    const caseData = emergencyHelpers.getById(id);
    if (!caseData) return null;

    // Validare tranziții
    const validTransitions: Record<string, string[]> = {
      arrival: ["triage"],
      triage: ["consent", "admission"],
      consent: ["admission", "treatment"],
      admission: ["treatment", "icu"],
      treatment: ["icu", "discharge"],
      icu: ["treatment", "discharge"],
      discharge: [],
    };

    const allowedStates = validTransitions[caseData.currentState];
    if (!allowedStates.includes(newState) && !skipReason) {
      throw new Error(`Tranziție invalidă de la ${caseData.currentState} la ${newState}. Este necesar un motiv pentru skip.`);
    }

    // Actualizează starea
    const updates: string[] = [];
    const values: any[] = [];

    updates.push("currentState = ?");
    values.push(newState);

    if (newState === "triage") {
      updates.push("triageTime = ?");
      values.push(now);
    } else if (newState === "admission") {
      updates.push("admissionTime = ?");
      values.push(now);
    } else if (newState === "discharge") {
      updates.push("dischargeTime = ?");
      values.push(now);
    }

    if (skipReason) {
      updates.push("skipReason = ?");
      values.push(skipReason);
    }

    updates.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    db.prepare(`UPDATE emergency_cases SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    // Adaugă tranziția în istoric
    emergencyHelpers.addStateTransition(id, caseData.currentState as "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge", newState as "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge", skipReason || "Tranziție normală", performedBy);

    return emergencyHelpers.getById(id);
  },

  assignDoctor: (id: string, doctorId: string) => {
    const now = new Date().toISOString();
    db.prepare(`UPDATE emergency_cases SET assignedDoctorId = ?, updatedAt = ? WHERE id = ?`).run(doctorId, now, id);
    return emergencyHelpers.getById(id);
  },

  addStateTransition: (emergencyCaseId: string, fromState: "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge", toState: "arrival" | "triage" | "consent" | "admission" | "treatment" | "icu" | "discharge", reason: string, performedBy: string, metadata?: any) => {
    const id = generateId();
    db.prepare(`
      INSERT INTO emergency_state_transitions (
        id, emergencyCaseId, fromState, toState, transitionReason, performedBy, timestamp, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      emergencyCaseId,
      fromState,
      toState,
      reason,
      performedBy,
      new Date().toISOString(),
      metadata ? JSON.stringify(metadata) : null
    );
    return { $id: id, emergencyCaseId, fromState, toState, transitionReason: reason, performedBy, timestamp: new Date() };
  },

  updateConsent: (id: string, consentGiven: boolean) => {
    const now = new Date().toISOString();
    db.prepare(`UPDATE emergency_cases SET consentGiven = ?, updatedAt = ? WHERE id = ?`).run(consentGiven ? 1 : 0, now, id);
    return emergencyHelpers.getById(id);
  },

  updateCarePlan: (id: string, carePlan: string) => {
    const now = new Date().toISOString();
    db.prepare(`UPDATE emergency_cases SET carePlan = ?, updatedAt = ? WHERE id = ?`).run(carePlan, now, id);
    return emergencyHelpers.getById(id);
  },

  updateDischargeLetter: (id: string, dischargeLetter: string) => {
    const now = new Date().toISOString();
    db.prepare(`UPDATE emergency_cases SET dischargeLetter = ?, updatedAt = ? WHERE id = ?`).run(dischargeLetter, now, id);
    return emergencyHelpers.getById(id);
  },
};

// Doctors on duty helpers
export const doctorsOnDutyHelpers = {
  create: (duty: {
    doctorName: string;
    weekStartDate: Date | string;
    weekEndDate: Date | string;
    specialty?: string;
    isAvailable?: boolean;
    maxConcurrentEmergencies?: number;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO doctors_on_duty (
        id, doctorName, weekStartDate, weekEndDate, specialty,
        isAvailable, maxConcurrentEmergencies, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      duty.doctorName,
      formatDate(duty.weekStartDate),
      formatDate(duty.weekEndDate),
      duty.specialty || null,
      duty.isAvailable !== false ? 1 : 0,
      duty.maxConcurrentEmergencies || 3,
      now,
      now
    );

    return doctorsOnDutyHelpers.getById(id);
  },

  getById: (id: string) => {
    const d = db.prepare("SELECT * FROM doctors_on_duty WHERE id = ?").get(id) as any;
    if (!d) return null;
    return {
      $id: d.id,
      doctorName: d.doctorName,
      weekStartDate: parseDate(d.weekStartDate),
      weekEndDate: parseDate(d.weekEndDate),
      specialty: d.specialty,
      isAvailable: d.isAvailable === 1,
      maxConcurrentEmergencies: d.maxConcurrentEmergencies,
      createdAt: parseDate(d.createdAt),
      updatedAt: parseDate(d.updatedAt),
    };
  },

  getAvailableDoctors: () => {
    const now = new Date().toISOString();
    const doctors = db.prepare(`
      SELECT d.*, 
        COUNT(e.id) as currentEmergencies
      FROM doctors_on_duty d
      LEFT JOIN emergency_cases e ON d.doctorName = e.assignedDoctorId 
        AND e.currentState NOT IN ('discharge')
      WHERE d.isAvailable = 1
        AND d.weekStartDate <= ?
        AND d.weekEndDate >= ?
      GROUP BY d.id
      HAVING currentEmergencies < d.maxConcurrentEmergencies
      ORDER BY currentEmergencies ASC
    `).all(now, now) as any[];

    return doctors.map(d => ({
      $id: d.id,
      doctorName: d.doctorName,
      weekStartDate: parseDate(d.weekStartDate),
      weekEndDate: parseDate(d.weekEndDate),
      specialty: d.specialty,
      isAvailable: d.isAvailable === 1,
      maxConcurrentEmergencies: d.maxConcurrentEmergencies,
      currentEmergencies: d.currentEmergencies || 0,
      createdAt: parseDate(d.createdAt),
      updatedAt: parseDate(d.updatedAt),
    }));
  },

  // Calculează workload-ul pentru fiecare medic
  calculateWorkload: (doctorName: string) => {
    const now = new Date().toISOString();
    
    // Număr urgente active
    const activeEmergencies = db.prepare(`
      SELECT COUNT(*) as count
      FROM emergency_cases
      WHERE assignedDoctorId = ? AND currentState NOT IN ('discharge')
    `).get(doctorName) as { count: number };

    // Număr programări viitoare (scheduled)
    const upcomingAppointments = db.prepare(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE primaryPhysician = ? 
        AND status = 'scheduled'
        AND schedule >= ?
    `).get(doctorName, now) as { count: number };

    // Număr programări în așteptare (pending)
    const pendingAppointments = db.prepare(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE primaryPhysician = ? 
        AND status = 'pending'
    `).get(doctorName) as { count: number };

    // Urgente critice/urgente (prioritate mare)
    const highPriorityEmergencies = db.prepare(`
      SELECT COUNT(*) as count
      FROM emergency_cases
      WHERE assignedDoctorId = ? 
        AND currentState NOT IN ('discharge')
        AND priority >= 8
    `).get(doctorName) as { count: number };

    const emergencyCount = activeEmergencies?.count || 0;
    const scheduledCount = upcomingAppointments?.count || 0;
    const pendingCount = pendingAppointments?.count || 0;
    const highPriorityCount = highPriorityEmergencies?.count || 0;

    // Calculăm workload score (urgente au prioritate mai mare)
    // Urgente active: 3 puncte fiecare
    // Urgente critice: +2 puncte bonus
    // Programări scheduled: 1 punct fiecare
    // Programări pending: 0.5 puncte fiecare
    const workloadScore = 
      (emergencyCount * 3) + 
      (highPriorityCount * 2) + 
      (scheduledCount * 1) + 
      (pendingCount * 0.5);

    return {
      doctorName,
      emergencyCount,
      scheduledCount,
      pendingCount,
      highPriorityCount,
      workloadScore,
      totalLoad: emergencyCount + scheduledCount + pendingCount,
    };
  },

  // Obține workload-ul pentru toți medicii
  getAllWorkloads: () => {
    const { Doctors } = require("@/constants");
    return Doctors.map((doctor: { name: string }) => 
      doctorsOnDutyHelpers.calculateWorkload(doctor.name)
    ).sort((a: { workloadScore: number }, b: { workloadScore: number }) => a.workloadScore - b.workloadScore);
  },

  // Generează rotație automată pentru o perioadă specifică (12 ore)
  generateAutomaticRotationForPeriod: (options: {
    startDate: Date | string;
    endDate: Date | string;
    doctorsCount?: number;
  }) => {
    const { Doctors } = require("@/constants");
    const { startDate, endDate, doctorsCount = 3 } = options;

    // Helper pentru formatarea datelor
    const formatDate = (date: Date | string): string => {
      if (typeof date === "string") return date;
      return date.toISOString();
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Calculează workload-ul pentru toți medicii (bazat pe programări + urgente)
    const workloads = doctorsOnDutyHelpers.getAllWorkloads();
    
    // Sortează după workload (cel mai puțin ocupat primul)
    const sortedDoctors = workloads.sort((a: { workloadScore: number }, b: { workloadScore: number }) => a.workloadScore - b.workloadScore);

    // Verifică dacă există deja o rotație pentru această perioadă
    const existingRotation = db.prepare(`
      SELECT * FROM doctors_on_duty
      WHERE weekStartDate = ? AND weekEndDate = ?
    `).all(startDateStr, endDateStr) as any[];

    if (existingRotation.length > 0) {
      // Șterge rotația existentă
      db.prepare(`
        DELETE FROM doctors_on_duty
        WHERE weekStartDate = ? AND weekEndDate = ?
      `).run(startDateStr, endDateStr);
    }

    // Selectează medicii cu cel mai mic workload
    const selectedDoctors = sortedDoctors.slice(0, Math.min(doctorsCount, sortedDoctors.length));

    // Creează înregistrări pentru fiecare medic selectat
    const rotation = selectedDoctors.map((workload: { doctorName: string }) => {
      const doctor = Doctors.find((d: { name: string; specialty?: string }) => d.name === workload.doctorName);
      return doctorsOnDutyHelpers.create({
        doctorName: workload.doctorName,
        weekStartDate: startDate,
        weekEndDate: endDate,
        specialty: doctor?.specialty,
        isAvailable: true,
        maxConcurrentEmergencies: 3,
      });
    });

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      doctors: rotation,
      totalDoctors: rotation.length,
    };
  },

  // Generează rotație automată pentru săptămâna următoare
  generateAutomaticRotation: (options?: {
    doctorsPerWeek?: number;
    minDoctorsPerWeek?: number;
    maxDoctorsPerWeek?: number;
  }) => {
    const { Doctors } = require("@/constants");
    const { doctorsPerWeek = 3, minDoctorsPerWeek = 2, maxDoctorsPerWeek = 5 } = options || {};

    // Calculează workload-ul pentru toți medicii
    const workloads = doctorsOnDutyHelpers.getAllWorkloads();
    
    // Sortează după workload (cel mai puțin ocupat primul)
    const sortedDoctors = workloads.sort((a: { workloadScore: number }, b: { workloadScore: number }) => a.workloadScore - b.workloadScore);

    // Calculează data de început a săptămânii următoare (luni)
    const today = new Date();
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);

    // Calculează data de sfârșit a săptămânii (duminică)
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    // Verifică dacă există deja o rotație pentru această săptămână
    const existingRotation = db.prepare(`
      SELECT * FROM doctors_on_duty
      WHERE weekStartDate = ? AND weekEndDate = ?
    `).all(
      nextMonday.toISOString(),
      nextSunday.toISOString()
    ) as any[];

    if (existingRotation.length > 0) {
      // Șterge rotația existentă
      db.prepare(`
        DELETE FROM doctors_on_duty
        WHERE weekStartDate = ? AND weekEndDate = ?
      `).run(nextMonday.toISOString(), nextSunday.toISOString());
    }

    // Selectează medicii cu cel mai mic workload
    const selectedDoctors = sortedDoctors.slice(0, Math.min(doctorsPerWeek, sortedDoctors.length));

    // Creează înregistrări pentru fiecare medic selectat
    const rotation = selectedDoctors.map((workload: { doctorName: string }) => {
      const doctor = Doctors.find((d: { name: string; specialty?: string }) => d.name === workload.doctorName);
      return doctorsOnDutyHelpers.create({
        doctorName: workload.doctorName,
        weekStartDate: nextMonday,
        weekEndDate: nextSunday,
        specialty: doctor?.specialty,
        isAvailable: true,
        maxConcurrentEmergencies: 3,
      });
    });

    return {
      weekStart: nextMonday,
      weekEnd: nextSunday,
      doctors: rotation,
      totalDoctors: rotation.length,
    };
  },
};

// Medical Records Helpers
export const medicalRecordHelpers = {
  create: (record: {
    patientId: string;
    appointmentId?: string;
    doctorName: string;
    recordType: string;
    visitDate: Date | string;
    chiefComplaint?: string;
    subjectiveNotes?: string;
    objectiveFindings?: string;
    assessment?: string;
    plan?: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO medical_records (
        id, patientId, appointmentId, doctorName, recordType, visitDate,
        chiefComplaint, subjectiveNotes, objectiveFindings, assessment, plan, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      record.patientId,
      record.appointmentId || null,
      record.doctorName,
      record.recordType,
      formatDate(record.visitDate),
      record.chiefComplaint || null,
      record.subjectiveNotes || null,
      record.objectiveFindings || null,
      record.assessment || null,
      record.plan || null,
      record.notes || null,
      now,
      now
    );

    return medicalRecordHelpers.getById(id);
  },

  getById: (id: string) => {
    const record = db.prepare("SELECT * FROM medical_records WHERE id = ?").get(id) as any;
    if (!record) return null;

    const diagnoses = diagnosisHelpers.getByMedicalRecordId(id);
    const prescriptions = prescriptionHelpers.getByMedicalRecordId(id);
    const vitalSigns = vitalSignsHelpers.getByMedicalRecordId(id);
    const labResults = labResultHelpers.getByMedicalRecordId(id);
    const procedures = procedureHelpers.getByMedicalRecordId(id);

    return {
      $id: record.id,
      patientId: record.patientId,
      appointmentId: record.appointmentId,
      doctorName: record.doctorName,
      recordType: record.recordType,
      visitDate: parseDate(record.visitDate),
      chiefComplaint: record.chiefComplaint,
      subjectiveNotes: record.subjectiveNotes,
      objectiveFindings: record.objectiveFindings,
      assessment: record.assessment,
      plan: record.plan,
      notes: record.notes,
      createdAt: parseDate(record.createdAt),
      updatedAt: parseDate(record.updatedAt),
      diagnoses,
      prescriptions,
      vitalSigns: vitalSigns?.[0] || null,
      labResults,
      procedures,
    };
  },

  /** Returnează ultimul medical record al pacientului sau creează unul minimal pentru import analize */
  getOrCreateForLabImport: (patientId: string, appointmentId?: string | null) => {
    const existing = db.prepare(`
      SELECT id FROM medical_records WHERE patientId = ? ORDER BY visitDate DESC LIMIT 1
    `).get(patientId) as { id: string } | undefined;
    if (existing) return existing.id;
    const record = medicalRecordHelpers.create({
      patientId,
      appointmentId: appointmentId || undefined,
      doctorName: "Laborator",
      recordType: "lab_result",
      visitDate: new Date(),
    });
    if (!record) throw new Error("Failed to create medical record for lab import");
    return record.$id;
  },

  getByAppointmentId: (appointmentId: string) => {
    const record = db.prepare(`
      SELECT * FROM medical_records 
      WHERE appointmentId = ?
    `).get(appointmentId) as any;

    if (!record) return null;

    const diagnoses = diagnosisHelpers.getByMedicalRecordId(record.id);
    const prescriptions = prescriptionHelpers.getByMedicalRecordId(record.id);
    const vitalSigns = vitalSignsHelpers.getByMedicalRecordId(record.id);
    const labResults = labResultHelpers.getByMedicalRecordId(record.id);
    const procedures = procedureHelpers.getByMedicalRecordId(record.id);

    return {
      $id: record.id,
      patientId: record.patientId,
      appointmentId: record.appointmentId,
      doctorName: record.doctorName,
      recordType: record.recordType,
      visitDate: parseDate(record.visitDate),
      chiefComplaint: record.chiefComplaint,
      subjectiveNotes: record.subjectiveNotes,
      objectiveFindings: record.objectiveFindings,
      assessment: record.assessment,
      plan: record.plan,
      notes: record.notes,
      createdAt: parseDate(record.createdAt),
      updatedAt: parseDate(record.updatedAt),
      diagnoses,
      prescriptions,
      vitalSigns: vitalSigns?.[0] || null,
      labResults,
      procedures,
    };
  },

  getByPatientId: (patientId: string) => {
    const records = db.prepare(`
      SELECT * FROM medical_records 
      WHERE patientId = ? 
      ORDER BY visitDate DESC
    `).all(patientId) as any[];

    return records.map((record) => {
      const diagnoses = diagnosisHelpers.getByMedicalRecordId(record.id);
      const prescriptions = prescriptionHelpers.getByMedicalRecordId(record.id);
      const vitalSigns = vitalSignsHelpers.getByMedicalRecordId(record.id);
      const labResults = labResultHelpers.getByMedicalRecordId(record.id);
      const procedures = procedureHelpers.getByMedicalRecordId(record.id);

      return {
        $id: record.id,
        patientId: record.patientId,
        appointmentId: record.appointmentId,
        doctorName: record.doctorName,
        recordType: record.recordType,
        visitDate: parseDate(record.visitDate),
        chiefComplaint: record.chiefComplaint,
        subjectiveNotes: record.subjectiveNotes,
        objectiveFindings: record.objectiveFindings,
        assessment: record.assessment,
        plan: record.plan,
        notes: record.notes,
        createdAt: parseDate(record.createdAt),
        updatedAt: parseDate(record.updatedAt),
        diagnoses,
        prescriptions,
        vitalSigns: vitalSigns?.[0] || null,
        labResults,
        procedures,
      };
    });
  },

  update: (id: string, updates: Partial<{
    chiefComplaint: string;
    subjectiveNotes: string;
    objectiveFindings: string;
    assessment: string;
    plan: string;
    notes: string;
  }>) => {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value || null);
    });

    if (fields.length === 0) return medicalRecordHelpers.getById(id);

    fields.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    db.prepare(`UPDATE medical_records SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return medicalRecordHelpers.getById(id);
  },
};

// Diagnosis Helpers
export const diagnosisHelpers = {
  create: (diagnosis: {
    medicalRecordId: string;
    diagnosisCode?: string;
    diagnosisName: string;
    diagnosisType: string;
    status: string;
    onsetDate?: Date | string;
    resolvedDate?: Date | string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO diagnoses (
        id, medicalRecordId, diagnosisCode, diagnosisName, diagnosisType, status,
        onsetDate, resolvedDate, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      diagnosis.medicalRecordId,
      diagnosis.diagnosisCode || null,
      diagnosis.diagnosisName,
      diagnosis.diagnosisType,
      diagnosis.status,
      diagnosis.onsetDate ? formatDate(diagnosis.onsetDate) : null,
      diagnosis.resolvedDate ? formatDate(diagnosis.resolvedDate) : null,
      diagnosis.notes || null,
      now
    );

    return diagnosisHelpers.getById(id);
  },

  getById: (id: string) => {
    const d = db.prepare("SELECT * FROM diagnoses WHERE id = ?").get(id) as any;
    if (!d) return null;
    return {
      $id: d.id,
      medicalRecordId: d.medicalRecordId,
      diagnosisCode: d.diagnosisCode,
      diagnosisName: d.diagnosisName,
      diagnosisType: d.diagnosisType,
      status: d.status,
      onsetDate: d.onsetDate ? parseDate(d.onsetDate) : null,
      resolvedDate: d.resolvedDate ? parseDate(d.resolvedDate) : null,
      notes: d.notes,
      createdAt: parseDate(d.createdAt),
    };
  },

  getByMedicalRecordId: (medicalRecordId: string) => {
    const diagnoses = db.prepare(`
      SELECT * FROM diagnoses WHERE medicalRecordId = ? ORDER BY createdAt DESC
    `).all(medicalRecordId) as any[];

    return diagnoses.map((d) => ({
      $id: d.id,
      medicalRecordId: d.medicalRecordId,
      diagnosisCode: d.diagnosisCode,
      diagnosisName: d.diagnosisName,
      diagnosisType: d.diagnosisType,
      status: d.status,
      onsetDate: d.onsetDate ? parseDate(d.onsetDate) : null,
      resolvedDate: d.resolvedDate ? parseDate(d.resolvedDate) : null,
      notes: d.notes,
      createdAt: parseDate(d.createdAt),
    }));
  },
};

// Prescription Helpers
export const prescriptionHelpers = {
  create: (prescription: {
    medicalRecordId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    route?: string;
    quantity?: string;
    startDate: Date | string;
    endDate?: Date | string;
    instructions?: string;
    refills?: number;
    status?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO prescriptions (
        id, medicalRecordId, medicationName, dosage, frequency, route, quantity,
        startDate, endDate, instructions, refills, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      prescription.medicalRecordId,
      prescription.medicationName,
      prescription.dosage,
      prescription.frequency,
      prescription.route || null,
      prescription.quantity || null,
      formatDate(prescription.startDate),
      prescription.endDate ? formatDate(prescription.endDate) : null,
      prescription.instructions || null,
      prescription.refills || 0,
      prescription.status || "active",
      now
    );

    return prescriptionHelpers.getById(id);
  },

  getById: (id: string) => {
    const p = db.prepare("SELECT * FROM prescriptions WHERE id = ?").get(id) as any;
    if (!p) return null;
    return {
      $id: p.id,
      medicalRecordId: p.medicalRecordId,
      medicationName: p.medicationName,
      dosage: p.dosage,
      frequency: p.frequency,
      route: p.route,
      quantity: p.quantity,
      startDate: parseDate(p.startDate),
      endDate: p.endDate ? parseDate(p.endDate) : null,
      instructions: p.instructions,
      refills: p.refills,
      status: p.status,
      discontinuedReason: p.discontinuedReason,
      createdAt: parseDate(p.createdAt),
    };
  },

  getByMedicalRecordId: (medicalRecordId: string) => {
    const prescriptions = db.prepare(`
      SELECT * FROM prescriptions WHERE medicalRecordId = ? ORDER BY startDate DESC
    `).all(medicalRecordId) as any[];

    return prescriptions.map((p) => ({
      $id: p.id,
      medicalRecordId: p.medicalRecordId,
      medicationName: p.medicationName,
      dosage: p.dosage,
      frequency: p.frequency,
      route: p.route,
      quantity: p.quantity,
      startDate: parseDate(p.startDate),
      endDate: p.endDate ? parseDate(p.endDate) : null,
      instructions: p.instructions,
      refills: p.refills,
      status: p.status,
      discontinuedReason: p.discontinuedReason,
      createdAt: parseDate(p.createdAt),
    }));
  },

  getActiveByPatientId: (patientId: string) => {
    const prescriptions = db.prepare(`
      SELECT p.* FROM prescriptions p
      JOIN medical_records mr ON p.medicalRecordId = mr.id
      WHERE mr.patientId = ? AND p.status = 'active'
      ORDER BY p.startDate DESC
    `).all(patientId) as any[];

    return prescriptions.map((p) => ({
      $id: p.id,
      medicalRecordId: p.medicalRecordId,
      medicationName: p.medicationName,
      dosage: p.dosage,
      frequency: p.frequency,
      route: p.route,
      quantity: p.quantity,
      startDate: parseDate(p.startDate),
      endDate: p.endDate ? parseDate(p.endDate) : null,
      instructions: p.instructions,
      refills: p.refills,
      status: p.status,
      discontinuedReason: p.discontinuedReason,
      createdAt: parseDate(p.createdAt),
    }));
  },
};

// Vital Signs Helpers
export const vitalSignsHelpers = {
  create: (vitals: {
    medicalRecordId: string;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    pulse?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    glucoseLevel?: number;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    // Calculează BMI dacă există weight și height
    let bmi = vitals.bmi;
    if (!bmi && vitals.weight && vitals.height) {
      const heightInMeters = vitals.height / 100;
      bmi = vitals.weight / (heightInMeters * heightInMeters);
    }

    db.prepare(`
      INSERT INTO vital_signs (
        id, medicalRecordId, bloodPressureSystolic, bloodPressureDiastolic,
        pulse, temperature, oxygenSaturation, respiratoryRate,
        weight, height, bmi, glucoseLevel, notes, recordedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      vitals.medicalRecordId,
      vitals.bloodPressureSystolic || null,
      vitals.bloodPressureDiastolic || null,
      vitals.pulse || null,
      vitals.temperature || null,
      vitals.oxygenSaturation || null,
      vitals.respiratoryRate || null,
      vitals.weight || null,
      vitals.height || null,
      bmi || null,
      vitals.glucoseLevel || null,
      vitals.notes || null,
      now
    );

    return vitalSignsHelpers.getById(id);
  },

  getById: (id: string) => {
    const v = db.prepare("SELECT * FROM vital_signs WHERE id = ?").get(id) as any;
    if (!v) return null;
    return {
      $id: v.id,
      medicalRecordId: v.medicalRecordId,
      bloodPressureSystolic: v.bloodPressureSystolic,
      bloodPressureDiastolic: v.bloodPressureDiastolic,
      pulse: v.pulse,
      temperature: v.temperature,
      oxygenSaturation: v.oxygenSaturation,
      respiratoryRate: v.respiratoryRate,
      weight: v.weight,
      height: v.height,
      bmi: v.bmi,
      glucoseLevel: v.glucoseLevel,
      notes: v.notes,
      recordedAt: parseDate(v.recordedAt),
    };
  },

  getByMedicalRecordId: (medicalRecordId: string) => {
    const vitals = db.prepare(`
      SELECT * FROM vital_signs WHERE medicalRecordId = ? ORDER BY recordedAt DESC
    `).all(medicalRecordId) as any[];

    return vitals.map((v) => ({
      $id: v.id,
      medicalRecordId: v.medicalRecordId,
      bloodPressureSystolic: v.bloodPressureSystolic,
      bloodPressureDiastolic: v.bloodPressureDiastolic,
      pulse: v.pulse,
      temperature: v.temperature,
      oxygenSaturation: v.oxygenSaturation,
      respiratoryRate: v.respiratoryRate,
      weight: v.weight,
      height: v.height,
      bmi: v.bmi,
      glucoseLevel: v.glucoseLevel,
      notes: v.notes,
      recordedAt: parseDate(v.recordedAt),
    }));
  },

  getByPatientId: (patientId: string) => {
    const vitals = db.prepare(`
      SELECT vs.* FROM vital_signs vs
      JOIN medical_records mr ON vs.medicalRecordId = mr.id
      WHERE mr.patientId = ?
      ORDER BY vs.recordedAt DESC
    `).all(patientId) as any[];

    return vitals.map((v) => ({
      $id: v.id,
      medicalRecordId: v.medicalRecordId,
      bloodPressureSystolic: v.bloodPressureSystolic,
      bloodPressureDiastolic: v.bloodPressureDiastolic,
      pulse: v.pulse,
      temperature: v.temperature,
      oxygenSaturation: v.oxygenSaturation,
      respiratoryRate: v.respiratoryRate,
      weight: v.weight,
      height: v.height,
      bmi: v.bmi,
      glucoseLevel: v.glucoseLevel,
      notes: v.notes,
      recordedAt: parseDate(v.recordedAt),
    }));
  },
};

// Lab Results Helpers
export const labResultHelpers = {
  create: (labResult: {
    medicalRecordId: string;
    appointmentId?: string;
    testName: string;
    testCategory?: string;
    resultValue?: string;
    unit?: string;
    referenceRange?: string;
    status?: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO lab_results (
        id, medicalRecordId, appointmentId, testName, testCategory,
        resultValue, unit, referenceRange, status, notes, performedDate, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      labResult.medicalRecordId,
      labResult.appointmentId || null,
      labResult.testName,
      labResult.testCategory || null,
      labResult.resultValue || null,
      labResult.unit || null,
      labResult.referenceRange || null,
      labResult.status || "normal",
      labResult.notes || null,
      now,
      now
    );

    return labResultHelpers.getById(id);
  },

  getById: (id: string) => {
    const l = db.prepare("SELECT * FROM lab_results WHERE id = ?").get(id) as any;
    if (!l) return null;
    return {
      $id: l.id,
      medicalRecordId: l.medicalRecordId,
      appointmentId: l.appointmentId,
      testName: l.testName,
      testCategory: l.testCategory,
      resultValue: l.resultValue,
      unit: l.unit,
      referenceRange: l.referenceRange,
      status: l.status,
      notes: l.notes,
      performedDate: parseDate(l.performedDate),
      createdAt: parseDate(l.createdAt),
    };
  },

  getByMedicalRecordId: (medicalRecordId: string) => {
    const results = db.prepare(`
      SELECT * FROM lab_results WHERE medicalRecordId = ? ORDER BY performedDate DESC
    `).all(medicalRecordId) as any[];

    return results.map((l) => ({
      $id: l.id,
      medicalRecordId: l.medicalRecordId,
      appointmentId: l.appointmentId,
      testName: l.testName,
      testCategory: l.testCategory,
      resultValue: l.resultValue,
      unit: l.unit,
      referenceRange: l.referenceRange,
      status: l.status,
      notes: l.notes,
      performedDate: parseDate(l.performedDate),
      createdAt: parseDate(l.createdAt),
    }));
  },

  getByPatientId: (patientId: string) => {
    // Obține analizele din lab_results asociate cu medical records ale pacientului
    const results = db.prepare(`
      SELECT lr.* FROM lab_results lr
      JOIN medical_records mr ON lr.medicalRecordId = mr.id
      WHERE mr.patientId = ?
      ORDER BY lr.performedDate DESC
    `).all(patientId) as any[];

    return results.map((l) => ({
      $id: l.id,
      medicalRecordId: l.medicalRecordId,
      appointmentId: l.appointmentId,
      testName: l.testName,
      testCategory: l.testCategory,
      resultValue: l.resultValue,
      unit: l.unit,
      referenceRange: l.referenceRange,
      status: l.status,
      notes: l.notes,
      performedDate: parseDate(l.performedDate),
      createdAt: parseDate(l.createdAt),
    }));
  },
};

// Procedure Helpers
export const procedureHelpers = {
  create: (procedure: {
    medicalRecordId: string;
    procedureName: string;
    procedureCode?: string;
    procedureDate: Date | string;
    performedBy: string;
    location?: string;
    anesthesiaType?: string;
    complications?: string;
    outcome?: string;
    followUpRequired?: boolean;
    followUpDate?: Date | string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO procedures (
        id, medicalRecordId, procedureName, procedureCode, procedureDate,
        performedBy, location, anesthesiaType, complications, outcome,
        followUpRequired, followUpDate, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      procedure.medicalRecordId,
      procedure.procedureName,
      procedure.procedureCode || null,
      formatDate(procedure.procedureDate),
      procedure.performedBy,
      procedure.location || null,
      procedure.anesthesiaType || null,
      procedure.complications || null,
      procedure.outcome || null,
      procedure.followUpRequired ? 1 : 0,
      procedure.followUpDate ? formatDate(procedure.followUpDate) : null,
      procedure.notes || null,
      now
    );

    return procedureHelpers.getById(id);
  },

  getById: (id: string) => {
    const p = db.prepare("SELECT * FROM procedures WHERE id = ?").get(id) as any;
    if (!p) return null;
    return {
      $id: p.id,
      medicalRecordId: p.medicalRecordId,
      procedureName: p.procedureName,
      procedureCode: p.procedureCode,
      procedureDate: parseDate(p.procedureDate),
      performedBy: p.performedBy,
      location: p.location,
      anesthesiaType: p.anesthesiaType,
      complications: p.complications,
      outcome: p.outcome,
      followUpRequired: p.followUpRequired === 1,
      followUpDate: p.followUpDate ? parseDate(p.followUpDate) : null,
      notes: p.notes,
      createdAt: parseDate(p.createdAt),
    };
  },

  getByMedicalRecordId: (medicalRecordId: string) => {
    const procedures = db.prepare(`
      SELECT * FROM procedures WHERE medicalRecordId = ? ORDER BY procedureDate DESC
    `).all(medicalRecordId) as any[];

    return procedures.map((p) => ({
      $id: p.id,
      medicalRecordId: p.medicalRecordId,
      procedureName: p.procedureName,
      procedureCode: p.procedureCode,
      procedureDate: parseDate(p.procedureDate),
      performedBy: p.performedBy,
      location: p.location,
      anesthesiaType: p.anesthesiaType,
      complications: p.complications,
      outcome: p.outcome,
      followUpRequired: p.followUpRequired === 1,
      followUpDate: p.followUpDate ? parseDate(p.followUpDate) : null,
      notes: p.notes,
      createdAt: parseDate(p.createdAt),
    }));
  },
};

// Allergy Helpers
export const allergyHelpers = {
  create: (allergy: {
    patientId: string;
    allergenType: string;
    allergenName: string;
    reactionType: string;
    severity: string;
    symptoms?: string;
    firstOccurrenceDate?: Date | string;
    lastOccurrenceDate?: Date | string;
    status?: string;
    notes?: string;
    reportedBy?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO allergies_adverse_reactions (
        id, patientId, allergenType, allergenName, reactionType, severity,
        symptoms, firstOccurrenceDate, lastOccurrenceDate, status, notes, reportedBy,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      allergy.patientId,
      allergy.allergenType,
      allergy.allergenName,
      allergy.reactionType,
      allergy.severity,
      allergy.symptoms || null,
      allergy.firstOccurrenceDate ? formatDate(allergy.firstOccurrenceDate) : null,
      allergy.lastOccurrenceDate ? formatDate(allergy.lastOccurrenceDate) : null,
      allergy.status || "active",
      allergy.notes || null,
      allergy.reportedBy || null,
      now,
      now
    );

    return allergyHelpers.getById(id);
  },

  getById: (id: string) => {
    const a = db.prepare("SELECT * FROM allergies_adverse_reactions WHERE id = ?").get(id) as any;
    if (!a) return null;
    return {
      $id: a.id,
      patientId: a.patientId,
      allergenType: a.allergenType,
      allergenName: a.allergenName,
      reactionType: a.reactionType,
      severity: a.severity,
      symptoms: a.symptoms,
      firstOccurrenceDate: a.firstOccurrenceDate ? parseDate(a.firstOccurrenceDate) : null,
      lastOccurrenceDate: a.lastOccurrenceDate ? parseDate(a.lastOccurrenceDate) : null,
      status: a.status,
      notes: a.notes,
      reportedBy: a.reportedBy,
      createdAt: parseDate(a.createdAt),
      updatedAt: parseDate(a.updatedAt),
    };
  },

  getByPatientId: (patientId: string) => {
    const allergies = db.prepare(`
      SELECT * FROM allergies_adverse_reactions 
      WHERE patientId = ? 
      ORDER BY createdAt DESC
    `).all(patientId) as any[];

    return allergies.map((a) => ({
      $id: a.id,
      patientId: a.patientId,
      allergenType: a.allergenType,
      allergenName: a.allergenName,
      reactionType: a.reactionType,
      severity: a.severity,
      symptoms: a.symptoms,
      firstOccurrenceDate: a.firstOccurrenceDate ? parseDate(a.firstOccurrenceDate) : null,
      lastOccurrenceDate: a.lastOccurrenceDate ? parseDate(a.lastOccurrenceDate) : null,
      status: a.status,
      notes: a.notes,
      reportedBy: a.reportedBy,
      createdAt: parseDate(a.createdAt),
      updatedAt: parseDate(a.updatedAt),
    }));
  },

  update: (id: string, data: Record<string, any>) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data);
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const v = data[f];
      if (v instanceof Date) return v.toISOString();
      if (v === undefined) return null;
      return v;
    });

    db.prepare(`
      UPDATE allergies_adverse_reactions SET ${setClause}, updatedAt = ? WHERE id = ?
    `).run(...values, now, id);

    return allergyHelpers.getById(id);
  },

  delete: (id: string) => {
    db.prepare("DELETE FROM allergies_adverse_reactions WHERE id = ?").run(id);
  },
};

// Vaccination Helpers
export const vaccinationHelpers = {
  create: (vaccination: {
    patientId: string;
    vaccineName: string;
    vaccineType?: string;
    administrationDate: Date | string;
    administeredBy?: string;
    lotNumber?: string;
    manufacturer?: string;
    site?: string;
    nextDoseDate?: Date | string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO vaccinations (
        id, patientId, vaccineName, vaccineType, administrationDate,
        administeredBy, lotNumber, manufacturer, site, nextDoseDate, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      vaccination.patientId,
      vaccination.vaccineName,
      vaccination.vaccineType || null,
      formatDate(vaccination.administrationDate),
      vaccination.administeredBy || null,
      vaccination.lotNumber || null,
      vaccination.manufacturer || null,
      vaccination.site || null,
      vaccination.nextDoseDate ? formatDate(vaccination.nextDoseDate) : null,
      vaccination.notes || null,
      now
    );

    return vaccinationHelpers.getById(id);
  },

  getById: (id: string) => {
    const v = db.prepare("SELECT * FROM vaccinations WHERE id = ?").get(id) as any;
    if (!v) return null;
    return {
      $id: v.id,
      patientId: v.patientId,
      vaccineName: v.vaccineName,
      vaccineType: v.vaccineType,
      administrationDate: parseDate(v.administrationDate),
      administeredBy: v.administeredBy,
      lotNumber: v.lotNumber,
      manufacturer: v.manufacturer,
      site: v.site,
      nextDoseDate: v.nextDoseDate ? parseDate(v.nextDoseDate) : null,
      notes: v.notes,
      createdAt: parseDate(v.createdAt),
    };
  },

  getByPatientId: (patientId: string) => {
    const vaccinations = db.prepare(`
      SELECT * FROM vaccinations 
      WHERE patientId = ? 
      ORDER BY administrationDate DESC
    `).all(patientId) as any[];

    return vaccinations.map((v) => ({
      $id: v.id,
      patientId: v.patientId,
      vaccineName: v.vaccineName,
      vaccineType: v.vaccineType,
      administrationDate: parseDate(v.administrationDate),
      administeredBy: v.administeredBy,
      lotNumber: v.lotNumber,
      manufacturer: v.manufacturer,
      site: v.site,
      nextDoseDate: v.nextDoseDate ? parseDate(v.nextDoseDate) : null,
      notes: v.notes,
      createdAt: parseDate(v.createdAt),
    }));
  },
};

// Family History Helpers
export const familyHistoryHelpers = {
  create: (familyHistory: {
    patientId: string;
    relation: string;
    condition: string;
    ageOfOnset?: number;
    status?: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO family_history (
        id, patientId, relation, condition, ageOfOnset, status, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      familyHistory.patientId,
      familyHistory.relation,
      familyHistory.condition,
      familyHistory.ageOfOnset || null,
      familyHistory.status || null,
      familyHistory.notes || null,
      now,
      now
    );

    return familyHistoryHelpers.getById(id);
  },

  getById: (id: string) => {
    const fh = db.prepare("SELECT * FROM family_history WHERE id = ?").get(id) as any;
    if (!fh) return null;
    return {
      $id: fh.id,
      patientId: fh.patientId,
      relation: fh.relation,
      condition: fh.condition,
      ageOfOnset: fh.ageOfOnset,
      status: fh.status,
      notes: fh.notes,
      createdAt: parseDate(fh.createdAt),
      updatedAt: parseDate(fh.updatedAt),
    };
  },

  getByPatientId: (patientId: string) => {
    const history = db.prepare(`
      SELECT * FROM family_history 
      WHERE patientId = ? 
      ORDER BY createdAt DESC
    `).all(patientId) as any[];

    return history.map((fh) => ({
      $id: fh.id,
      patientId: fh.patientId,
      relation: fh.relation,
      condition: fh.condition,
      ageOfOnset: fh.ageOfOnset,
      status: fh.status,
      notes: fh.notes,
      createdAt: parseDate(fh.createdAt),
      updatedAt: parseDate(fh.updatedAt),
    }));
  },
};

// ICU (ATI) Helpers
export const icuHelpers = {
  // Room helpers
  getAllRooms: () => {
    const rooms = db.prepare("SELECT * FROM icu_rooms ORDER BY roomNumber ASC").all() as any[];
    return rooms.map((r) => ({
      $id: r.id,
      roomNumber: r.roomNumber,
      maxCapacity: r.maxCapacity,
      currentOccupancy: r.currentOccupancy,
      isAvailable: r.isAvailable === 1,
      equipment: r.equipment ? JSON.parse(r.equipment) : null,
      notes: r.notes,
      createdAt: parseDate(r.createdAt),
      updatedAt: parseDate(r.updatedAt),
    }));
  },

  getRoomById: (roomId: string) => {
    const r = db.prepare("SELECT * FROM icu_rooms WHERE id = ?").get(roomId) as any;
    if (!r) return null;
    return {
      $id: r.id,
      roomNumber: r.roomNumber,
      maxCapacity: r.maxCapacity,
      currentOccupancy: r.currentOccupancy,
      isAvailable: r.isAvailable === 1,
      equipment: r.equipment ? JSON.parse(r.equipment) : null,
      notes: r.notes,
      createdAt: parseDate(r.createdAt),
      updatedAt: parseDate(r.updatedAt),
    };
  },

  findAvailableRoom: () => {
    // Găsește prima sală disponibilă cu locuri libere
    const room = db.prepare(`
      SELECT * FROM icu_rooms 
      WHERE isAvailable = 1 AND currentOccupancy < maxCapacity 
      ORDER BY currentOccupancy ASC, roomNumber ASC 
      LIMIT 1
    `).get() as any;
    
    if (!room) return null;
    
    return {
      $id: room.id,
      roomNumber: room.roomNumber,
      maxCapacity: room.maxCapacity,
      currentOccupancy: room.currentOccupancy,
      isAvailable: room.isAvailable === 1,
      equipment: room.equipment ? JSON.parse(room.equipment) : null,
      notes: room.notes,
      createdAt: parseDate(room.createdAt),
      updatedAt: parseDate(room.updatedAt),
    };
  },

  updateRoomOccupancy: (roomId: string, delta: number) => {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE icu_rooms 
      SET currentOccupancy = currentOccupancy + ?, 
          updatedAt = ?,
          isAvailable = CASE WHEN (currentOccupancy + ?) < maxCapacity THEN 1 ELSE 0 END
      WHERE id = ?
    `).run(delta, now, delta, roomId);
    return icuHelpers.getRoomById(roomId);
  },

  // Patient helpers
  admitPatient: (params: {
    emergencyCaseId?: string | null;
    patientId?: string | null;
    patientName?: string;
    patientPhone?: string;
    patientAge?: string;
    patientGender?: string;
    diagnosis?: string;
    assignedDoctorId?: string;
  }) => {
    // Găsește o sală disponibilă
    const availableRoom = icuHelpers.findAvailableRoom();
    if (!availableRoom) {
      throw new Error("Nu există săli ATI disponibile");
    }

    // Găsește primul pat liber din sală
    const occupiedBeds = db.prepare(`
      SELECT bedNumber FROM icu_patients 
      WHERE roomId = ? AND dischargeDate IS NULL
    `).all(availableRoom.$id) as { bedNumber: number }[];
    
    const occupiedBedNumbers = new Set(occupiedBeds.map(b => b.bedNumber));
    let bedNumber = 1;
    while (occupiedBedNumbers.has(bedNumber) && bedNumber <= availableRoom.maxCapacity) {
      bedNumber++;
    }
    
    if (bedNumber > availableRoom.maxCapacity) {
      throw new Error("Nu există paturi disponibile în sală");
    }

    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO icu_patients (
        id, emergencyCaseId, patientId, patientName, patientPhone, patientAge, patientGender,
        roomId, bedNumber, admissionDate, status, assignedDoctorId, diagnosis, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'critical', ?, ?, ?, ?)
    `).run(
      id,
      params.emergencyCaseId || null,
      params.patientId || null,
      params.patientName || null,
      params.patientPhone || null,
      params.patientAge || null,
      params.patientGender || null,
      availableRoom.$id,
      bedNumber,
      now,
      params.assignedDoctorId || null,
      params.diagnosis || null,
      now,
      now
    );

    // Actualizează ocuparea sălii
    icuHelpers.updateRoomOccupancy(availableRoom.$id, 1);

    return icuHelpers.getPatientById(id);
  },

  getAllPatients: () => {
    const patients = db.prepare(`
      SELECT 
        p.*,
        r.roomNumber,
        pat.id as patient_id,
        pat.name as patient_name
      FROM icu_patients p
      LEFT JOIN icu_rooms r ON p.roomId = r.id
      LEFT JOIN patients pat ON p.patientId = pat.id
      WHERE p.dischargeDate IS NULL
      ORDER BY p.admissionDate DESC
    `).all() as any[];

    return patients.map((p) => ({
      $id: p.id,
      emergencyCaseId: p.emergencyCaseId,
      patientId: p.patientId,
      patientName: p.patientName || p.patient_name,
      patientPhone: p.patientPhone,
      patientAge: p.patientAge,
      patientGender: p.patientGender,
      roomId: p.roomId,
      bedNumber: p.bedNumber,
      admissionDate: parseDate(p.admissionDate),
      dischargeDate: p.dischargeDate ? parseDate(p.dischargeDate) : null,
      status: p.status,
      assignedDoctorId: p.assignedDoctorId,
      diagnosis: p.diagnosis,
      notes: p.notes,
      createdAt: parseDate(p.createdAt),
      updatedAt: parseDate(p.updatedAt),
      room: {
        $id: p.roomId,
        roomNumber: p.roomNumber,
      },
    }));
  },

  getPatientById: (id: string) => {
    const p = db.prepare(`
      SELECT 
        p.*,
        r.roomNumber,
        r.maxCapacity,
        pat.id as patient_id,
        pat.name as patient_name
      FROM icu_patients p
      LEFT JOIN icu_rooms r ON p.roomId = r.id
      LEFT JOIN patients pat ON p.patientId = pat.id
      WHERE p.id = ?
    `).get(id) as any;

    if (!p) return null;

    return {
      $id: p.id,
      emergencyCaseId: p.emergencyCaseId,
      patientId: p.patientId,
      patientName: p.patientName || p.patient_name,
      patientPhone: p.patientPhone,
      patientAge: p.patientAge,
      patientGender: p.patientGender,
      roomId: p.roomId,
      bedNumber: p.bedNumber,
      admissionDate: parseDate(p.admissionDate),
      dischargeDate: p.dischargeDate ? parseDate(p.dischargeDate) : null,
      status: p.status,
      assignedDoctorId: p.assignedDoctorId,
      diagnosis: p.diagnosis,
      notes: p.notes,
      createdAt: parseDate(p.createdAt),
      updatedAt: parseDate(p.updatedAt),
      room: {
        $id: p.roomId,
        roomNumber: p.roomNumber,
        maxCapacity: p.maxCapacity,
      },
    };
  },

  updatePatientStatus: (id: string, status: "critical" | "stable" | "improving" | "deteriorating") => {
    const now = new Date().toISOString();
    db.prepare(`UPDATE icu_patients SET status = ?, updatedAt = ? WHERE id = ?`).run(status, now, id);
    return icuHelpers.getPatientById(id);
  },

  dischargePatient: (id: string) => {
    const patient = icuHelpers.getPatientById(id);
    if (!patient) return null;

    const now = new Date().toISOString();
    db.prepare(`UPDATE icu_patients SET dischargeDate = ?, updatedAt = ? WHERE id = ?`).run(now, now, id);

    // Actualizează ocuparea sălii
    icuHelpers.updateRoomOccupancy(patient.roomId, -1);

    return icuHelpers.getPatientById(id);
  },

  // Vital signs helpers
  addVitalSigns: (params: {
    icuPatientId: string;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    pulse?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    glucoseLevel?: number;
    consciousnessLevel?: "conscious" | "drowsy" | "unconscious";
    notes?: string;
    recordedBy?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO icu_vital_signs (
        id, icuPatientId, recordedAt, bloodPressureSystolic, bloodPressureDiastolic,
        pulse, temperature, oxygenSaturation, respiratoryRate, glucoseLevel,
        consciousnessLevel, notes, recordedBy, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.icuPatientId,
      now,
      params.bloodPressureSystolic || null,
      params.bloodPressureDiastolic || null,
      params.pulse || null,
      params.temperature || null,
      params.oxygenSaturation || null,
      params.respiratoryRate || null,
      params.glucoseLevel || null,
      params.consciousnessLevel || null,
      params.notes || null,
      params.recordedBy || null,
      now
    );

    return icuHelpers.getVitalSignsById(id);
  },

  getVitalSignsById: (id: string) => {
    const vs = db.prepare("SELECT * FROM icu_vital_signs WHERE id = ?").get(id) as any;
    if (!vs) return null;
    return {
      $id: vs.id,
      icuPatientId: vs.icuPatientId,
      recordedAt: parseDate(vs.recordedAt),
      bloodPressureSystolic: vs.bloodPressureSystolic,
      bloodPressureDiastolic: vs.bloodPressureDiastolic,
      pulse: vs.pulse,
      temperature: vs.temperature,
      oxygenSaturation: vs.oxygenSaturation,
      respiratoryRate: vs.respiratoryRate,
      glucoseLevel: vs.glucoseLevel,
      consciousnessLevel: vs.consciousnessLevel,
      notes: vs.notes,
      recordedBy: vs.recordedBy,
      createdAt: parseDate(vs.createdAt),
    };
  },

  getVitalSignsByPatientId: (icuPatientId: string, limit?: number) => {
    const query = limit
      ? `SELECT * FROM icu_vital_signs WHERE icuPatientId = ? ORDER BY recordedAt DESC LIMIT ?`
      : `SELECT * FROM icu_vital_signs WHERE icuPatientId = ? ORDER BY recordedAt DESC`;
    
    const signs = (limit
      ? db.prepare(query).all(icuPatientId, limit)
      : db.prepare(query).all(icuPatientId)) as any[];

    return signs.map((vs) => ({
      $id: vs.id,
      icuPatientId: vs.icuPatientId,
      recordedAt: parseDate(vs.recordedAt),
      bloodPressureSystolic: vs.bloodPressureSystolic,
      bloodPressureDiastolic: vs.bloodPressureDiastolic,
      pulse: vs.pulse,
      temperature: vs.temperature,
      oxygenSaturation: vs.oxygenSaturation,
      respiratoryRate: vs.respiratoryRate,
      glucoseLevel: vs.glucoseLevel,
      consciousnessLevel: vs.consciousnessLevel,
      notes: vs.notes,
      recordedBy: vs.recordedBy,
      createdAt: parseDate(vs.createdAt),
    }));
  },

  // Treatment helpers
  addTreatment: (params: {
    icuPatientId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    route?: string;
    administeredBy?: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO icu_treatments (
        id, icuPatientId, medicationName, dosage, frequency, route,
        startTime, administeredBy, notes, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(
      id,
      params.icuPatientId,
      params.medicationName,
      params.dosage,
      params.frequency,
      params.route || null,
      now,
      params.administeredBy || null,
      params.notes || null,
      now
    );

    return icuHelpers.getTreatmentById(id);
  },

  getTreatmentById: (id: string) => {
    const t = db.prepare("SELECT * FROM icu_treatments WHERE id = ?").get(id) as any;
    if (!t) return null;
    return {
      $id: t.id,
      icuPatientId: t.icuPatientId,
      medicationName: t.medicationName,
      dosage: t.dosage,
      frequency: t.frequency,
      route: t.route,
      startTime: parseDate(t.startTime),
      endTime: t.endTime ? parseDate(t.endTime) : null,
      administeredBy: t.administeredBy,
      notes: t.notes,
      status: t.status,
      createdAt: parseDate(t.createdAt),
    };
  },

  getTreatmentsByPatientId: (icuPatientId: string) => {
    const treatments = db.prepare(`
      SELECT * FROM icu_treatments 
      WHERE icuPatientId = ? 
      ORDER BY startTime DESC
    `).all(icuPatientId) as any[];

    return treatments.map((t) => ({
      $id: t.id,
      icuPatientId: t.icuPatientId,
      medicationName: t.medicationName,
      dosage: t.dosage,
      frequency: t.frequency,
      route: t.route,
      startTime: parseDate(t.startTime),
      endTime: t.endTime ? parseDate(t.endTime) : null,
      administeredBy: t.administeredBy,
      notes: t.notes,
      status: t.status,
      createdAt: parseDate(t.createdAt),
    }));
  },

  updateTreatmentStatus: (id: string, status: "active" | "completed" | "discontinued", endTime?: string) => {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE icu_treatments 
      SET status = ?, endTime = ?, updatedAt = ? 
      WHERE id = ?
    `).run(status, endTime || now, now, id);
    return icuHelpers.getTreatmentById(id);
  },
};

// Hospital Room & Admission Helpers (Spitalizări Normale)
export const hospitalRoomHelpers = {
  getAllRooms: (department?: string) => {
    let query = "SELECT * FROM hospital_rooms";
    const params: any[] = [];
    
    if (department) {
      query += " WHERE department = ?";
      params.push(department);
    }
    
    query += " ORDER BY floor ASC, roomNumber ASC";
    
    const rooms = db.prepare(query).all(...params) as any[];
    return rooms.map((r) => ({
      $id: r.id,
      roomNumber: r.roomNumber,
      floor: r.floor,
      department: r.department,
      roomType: r.roomType,
      maxCapacity: r.maxCapacity,
      currentOccupancy: r.currentOccupancy,
      isAvailable: r.isAvailable === 1,
      equipment: r.equipment ? JSON.parse(r.equipment) : null,
      notes: r.notes,
      createdAt: parseDate(r.createdAt),
      updatedAt: parseDate(r.updatedAt),
    }));
  },

  getRoomById: (roomId: string) => {
    const r = db.prepare("SELECT * FROM hospital_rooms WHERE id = ?").get(roomId) as any;
    if (!r) return null;
    return {
      $id: r.id,
      roomNumber: r.roomNumber,
      floor: r.floor,
      department: r.department,
      roomType: r.roomType,
      maxCapacity: r.maxCapacity,
      currentOccupancy: r.currentOccupancy,
      isAvailable: r.isAvailable === 1,
      equipment: r.equipment ? JSON.parse(r.equipment) : null,
      notes: r.notes,
      createdAt: parseDate(r.createdAt),
      updatedAt: parseDate(r.updatedAt),
    };
  },

  findAvailableRoom: (department: string, roomType?: string) => {
    let query = `
      SELECT * FROM hospital_rooms 
      WHERE department = ? AND isAvailable = 1 AND currentOccupancy < maxCapacity
    `;
    const params: any[] = [department];
    
    if (roomType) {
      query += " AND roomType = ?";
      params.push(roomType);
    }
    
    query += " ORDER BY currentOccupancy ASC, roomNumber ASC LIMIT 1";
    
    const room = db.prepare(query).get(...params) as any;
    
    if (!room) return null;
    
    return {
      $id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      department: room.department,
      roomType: room.roomType,
      maxCapacity: room.maxCapacity,
      currentOccupancy: room.currentOccupancy,
      isAvailable: room.isAvailable === 1,
      equipment: room.equipment ? JSON.parse(room.equipment) : null,
      notes: room.notes,
      createdAt: parseDate(room.createdAt),
      updatedAt: parseDate(room.updatedAt),
    };
  },

  findAvailableBed: (roomId: string) => {
    const room = hospitalRoomHelpers.getRoomById(roomId);
    if (!room || room.currentOccupancy >= room.maxCapacity) return null;

    // Găsește paturile ocupate în această sală
    const occupiedBeds = db.prepare(`
      SELECT bedNumber FROM hospital_admissions 
      WHERE roomId = ? AND dischargeDate IS NULL
    `).all(roomId) as Array<{ bedNumber: number }>;
    
    const occupiedBedNumbers = new Set(occupiedBeds.map((b) => b.bedNumber));
    
    // Găsește primul pat liber
    for (let i = 1; i <= room.maxCapacity; i++) {
      if (!occupiedBedNumbers.has(i)) {
        return i;
      }
    }
    
    return null;
  },

  updateRoomOccupancy: (roomId: string, delta: number) => {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE hospital_rooms 
      SET currentOccupancy = currentOccupancy + ?, updatedAt = ?
      WHERE id = ?
    `).run(delta, now, roomId);
  },
};

export const hospitalAdmissionHelpers = {
  admitPatient: (params: {
    patientId?: string | null;
    appointmentId?: string | null;
    patientName: string;
    patientPhone?: string;
    patientAge?: string;
    patientGender?: string;
    department: string;
    roomType?: string;
    admissionReason: string;
    diagnosis?: string;
    admittingDoctor: string;
    assignedDoctor?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    expectedLengthOfStay?: number;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    // Găsește o sală disponibilă
    const availableRoom = hospitalRoomHelpers.findAvailableRoom(
      params.department,
      params.roomType
    );

    if (!availableRoom) {
      throw new Error(`Nu există săli disponibile în secția ${params.department}`);
    }

    // Găsește un pat liber
    const bedNumber = hospitalRoomHelpers.findAvailableBed(availableRoom.$id);
    if (!bedNumber) {
      throw new Error("Nu există paturi disponibile în sala selectată");
    }

    // Creează internarea
    db.prepare(`
      INSERT INTO hospital_admissions (
        id, patientId, appointmentId, patientName, patientPhone, patientAge, patientGender,
        roomId, bedNumber, admissionDate, admissionType, admissionReason, diagnosis,
        admittingDoctor, assignedDoctor, department, insuranceProvider, insurancePolicyNumber,
        expectedLengthOfStay, status, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'elective', ?, ?, ?, ?, ?, ?, ?, ?, 'admitted', ?, ?, ?)
    `).run(
      id,
      params.patientId || null,
      params.appointmentId || null,
      params.patientName,
      params.patientPhone || null,
      params.patientAge || null,
      params.patientGender || null,
      availableRoom.$id,
      bedNumber,
      now,
      params.admissionReason,
      params.diagnosis || null,
      params.admittingDoctor,
      params.assignedDoctor || null,
      params.department,
      params.insuranceProvider || null,
      params.insurancePolicyNumber || null,
      params.expectedLengthOfStay || null,
      params.notes || null,
      now,
      now
    );

    // Actualizează ocuparea sălii
    hospitalRoomHelpers.updateRoomOccupancy(availableRoom.$id, 1);

    return hospitalAdmissionHelpers.getAdmissionById(id);
  },

  getAllAdmissions: (department?: string, status?: string) => {
    let query = `
      SELECT 
        a.*,
        r.roomNumber,
        r.floor,
        r.department as roomDepartment,
        pat.id as patient_id,
        pat.name as patient_name
      FROM hospital_admissions a
      LEFT JOIN hospital_rooms r ON a.roomId = r.id
      LEFT JOIN patients pat ON a.patientId = pat.id
      WHERE a.dischargeDate IS NULL
    `;
    const params: any[] = [];

    if (department) {
      query += " AND a.department = ?";
      params.push(department);
    }

    if (status) {
      query += " AND a.status = ?";
      params.push(status);
    }

    query += " ORDER BY a.admissionDate DESC";

    const admissions = db.prepare(query).all(...params) as any[];

    return admissions.map((a) => ({
      $id: a.id,
      patientId: a.patientId,
      appointmentId: a.appointmentId,
      patientName: a.patientName || a.patient_name,
      patientPhone: a.patientPhone,
      patientAge: a.patientAge,
      patientGender: a.patientGender,
      roomId: a.roomId,
      bedNumber: a.bedNumber,
      admissionDate: parseDate(a.admissionDate),
      dischargeDate: a.dischargeDate ? parseDate(a.dischargeDate) : null,
      admissionType: a.admissionType,
      admissionReason: a.admissionReason,
      diagnosis: a.diagnosis,
      admittingDoctor: a.admittingDoctor,
      assignedDoctor: a.assignedDoctor,
      department: a.department,
      insuranceProvider: a.insuranceProvider,
      insurancePolicyNumber: a.insurancePolicyNumber,
      expectedLengthOfStay: a.expectedLengthOfStay,
      status: a.status,
      dischargeInstructions: a.dischargeInstructions,
      notes: a.notes,
      createdAt: parseDate(a.createdAt),
      updatedAt: parseDate(a.updatedAt),
      room: {
        $id: a.roomId,
        roomNumber: a.roomNumber,
        floor: a.floor,
        department: a.roomDepartment,
      },
    }));
  },

  getAdmissionById: (id: string) => {
    const a = db.prepare(`
      SELECT 
        a.*,
        r.roomNumber,
        r.floor,
        r.department as roomDepartment,
        pat.id as patient_id,
        pat.name as patient_name
      FROM hospital_admissions a
      LEFT JOIN hospital_rooms r ON a.roomId = r.id
      LEFT JOIN patients pat ON a.patientId = pat.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!a) return null;

    return {
      $id: a.id,
      patientId: a.patientId,
      appointmentId: a.appointmentId,
      patientName: a.patientName || a.patient_name,
      patientPhone: a.patientPhone,
      patientAge: a.patientAge,
      patientGender: a.patientGender,
      roomId: a.roomId,
      bedNumber: a.bedNumber,
      admissionDate: parseDate(a.admissionDate),
      dischargeDate: a.dischargeDate ? parseDate(a.dischargeDate) : null,
      admissionType: a.admissionType,
      admissionReason: a.admissionReason,
      diagnosis: a.diagnosis,
      admittingDoctor: a.admittingDoctor,
      assignedDoctor: a.assignedDoctor,
      department: a.department,
      insuranceProvider: a.insuranceProvider,
      insurancePolicyNumber: a.insurancePolicyNumber,
      expectedLengthOfStay: a.expectedLengthOfStay,
      status: a.status,
      dischargeInstructions: a.dischargeInstructions,
      notes: a.notes,
      createdAt: parseDate(a.createdAt),
      updatedAt: parseDate(a.updatedAt),
      room: {
        $id: a.roomId,
        roomNumber: a.roomNumber,
        floor: a.floor,
        department: a.roomDepartment,
      },
    };
  },

  updateAdmission: (id: string, data: Record<string, any>) => {
    const now = new Date().toISOString();
    const fields = Object.keys(data);
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const v = data[f];
      if (v instanceof Date) return v.toISOString();
      if (v === undefined) return null;
      return v;
    });

    db.prepare(`
      UPDATE hospital_admissions SET ${setClause}, updatedAt = ? WHERE id = ?
    `).run(...values, now, id);

    return hospitalAdmissionHelpers.getAdmissionById(id);
  },

  dischargePatient: (id: string, dischargeInstructions?: string) => {
    const admission = hospitalAdmissionHelpers.getAdmissionById(id);
    if (!admission) throw new Error("Internarea nu a fost găsită");

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE hospital_admissions 
      SET dischargeDate = ?, status = 'discharged', dischargeInstructions = ?, updatedAt = ?
      WHERE id = ?
    `).run(now, dischargeInstructions || null, now, id);

    // Actualizează ocuparea sălii
    hospitalRoomHelpers.updateRoomOccupancy(admission.roomId, -1);

    return hospitalAdmissionHelpers.getAdmissionById(id);
  },

  addVitalSigns: (admissionId: string, vitalSigns: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    pulse?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    glucoseLevel?: number;
    weight?: number;
    notes?: string;
    recordedBy?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO hospital_vital_signs (
        id, admissionId, recordedAt, bloodPressureSystolic, bloodPressureDiastolic,
        pulse, temperature, oxygenSaturation, respiratoryRate, glucoseLevel, weight,
        notes, recordedBy, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      admissionId,
      now,
      vitalSigns.bloodPressureSystolic || null,
      vitalSigns.bloodPressureDiastolic || null,
      vitalSigns.pulse || null,
      vitalSigns.temperature || null,
      vitalSigns.oxygenSaturation || null,
      vitalSigns.respiratoryRate || null,
      vitalSigns.glucoseLevel || null,
      vitalSigns.weight || null,
      vitalSigns.notes || null,
      vitalSigns.recordedBy || null,
      now
    );

    return {
      $id: id,
      admissionId,
      recordedAt: parseDate(now),
      ...vitalSigns,
      createdAt: parseDate(now),
    };
  },

  getVitalSigns: (admissionId: string) => {
    const signs = db.prepare(`
      SELECT * FROM hospital_vital_signs 
      WHERE admissionId = ? 
      ORDER BY recordedAt DESC
    `).all(admissionId) as any[];

    return signs.map((s) => ({
      $id: s.id,
      admissionId: s.admissionId,
      recordedAt: parseDate(s.recordedAt),
      bloodPressureSystolic: s.bloodPressureSystolic,
      bloodPressureDiastolic: s.bloodPressureDiastolic,
      pulse: s.pulse,
      temperature: s.temperature,
      oxygenSaturation: s.oxygenSaturation,
      respiratoryRate: s.respiratoryRate,
      glucoseLevel: s.glucoseLevel,
      weight: s.weight,
      notes: s.notes,
      recordedBy: s.recordedBy,
      createdAt: parseDate(s.createdAt),
    }));
  },

  addTreatment: (admissionId: string, treatment: {
    medicationName: string;
    dosage: string;
    frequency: string;
    route?: string;
    administeredBy?: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO hospital_treatments (
        id, admissionId, medicationName, dosage, frequency, route,
        startTime, administeredBy, notes, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(
      id,
      admissionId,
      treatment.medicationName,
      treatment.dosage,
      treatment.frequency,
      treatment.route || null,
      now,
      treatment.administeredBy || null,
      treatment.notes || null,
      now
    );

    return {
      $id: id,
      admissionId,
      medicationName: treatment.medicationName,
      dosage: treatment.dosage,
      frequency: treatment.frequency,
      route: treatment.route,
      startTime: parseDate(now),
      endTime: null,
      administeredBy: treatment.administeredBy,
      notes: treatment.notes,
      status: "active",
      createdAt: parseDate(now),
    };
  },

  getTreatments: (admissionId: string) => {
    const treatments = db.prepare(`
      SELECT * FROM hospital_treatments 
      WHERE admissionId = ? 
      ORDER BY startTime DESC
    `).all(admissionId) as any[];

    return treatments.map((t) => ({
      $id: t.id,
      admissionId: t.admissionId,
      medicationName: t.medicationName,
      dosage: t.dosage,
      frequency: t.frequency,
      route: t.route,
      startTime: parseDate(t.startTime),
      endTime: t.endTime ? parseDate(t.endTime) : null,
      administeredBy: t.administeredBy,
      notes: t.notes,
      status: t.status,
      createdAt: parseDate(t.createdAt),
    }));
  },

  addProcedure: (admissionId: string, procedure: {
    procedureName: string;
    procedureDate: Date | string;
    performedBy: string;
    procedureType?: string;
    outcome?: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO hospital_procedures (
        id, admissionId, procedureName, procedureDate, performedBy,
        procedureType, outcome, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      admissionId,
      procedure.procedureName,
      formatDate(procedure.procedureDate),
      procedure.performedBy,
      procedure.procedureType || null,
      procedure.outcome || null,
      procedure.notes || null,
      now
    );

    return {
      $id: id,
      admissionId,
      procedureName: procedure.procedureName,
      procedureDate: parseDate(formatDate(procedure.procedureDate)),
      performedBy: procedure.performedBy,
      procedureType: procedure.procedureType,
      outcome: procedure.outcome,
      notes: procedure.notes,
      createdAt: parseDate(now),
    };
  },

  getProcedures: (admissionId: string) => {
    const procedures = db.prepare(`
      SELECT * FROM hospital_procedures 
      WHERE admissionId = ? 
      ORDER BY procedureDate DESC
    `).all(admissionId) as any[];

    return procedures.map((p) => ({
      $id: p.id,
      admissionId: p.admissionId,
      procedureName: p.procedureName,
      procedureDate: parseDate(p.procedureDate),
      performedBy: p.performedBy,
      procedureType: p.procedureType,
      outcome: p.outcome,
      notes: p.notes,
      createdAt: parseDate(p.createdAt),
    }));
  },
};

// Ambulance Helpers
export const ambulanceHelpers = {
  getAll: () => {
    const ambulances = db.prepare("SELECT * FROM ambulances ORDER BY ambulanceNumber").all() as any[];
    return ambulances.map((amb) => ({
      $id: amb.id,
      ambulanceNumber: amb.ambulanceNumber,
      licensePlate: amb.licensePlate,
      status: amb.status,
      currentLocation: amb.currentLocation ? JSON.parse(amb.currentLocation) : null,
      crew: JSON.parse(amb.crew),
      equipment: JSON.parse(amb.equipment),
      lastMaintenanceDate: amb.lastMaintenanceDate ? parseDate(amb.lastMaintenanceDate) : null,
      nextMaintenanceDate: amb.nextMaintenanceDate ? parseDate(amb.nextMaintenanceDate) : null,
      notes: amb.notes,
      createdAt: parseDate(amb.createdAt),
      updatedAt: parseDate(amb.updatedAt),
    }));
  },

  getById: (id: string) => {
    const amb = db.prepare("SELECT * FROM ambulances WHERE id = ?").get(id) as any;
    if (!amb) return null;
    return {
      $id: amb.id,
      ambulanceNumber: amb.ambulanceNumber,
      licensePlate: amb.licensePlate,
      status: amb.status,
      currentLocation: amb.currentLocation ? JSON.parse(amb.currentLocation) : null,
      crew: JSON.parse(amb.crew),
      equipment: JSON.parse(amb.equipment),
      lastMaintenanceDate: amb.lastMaintenanceDate ? parseDate(amb.lastMaintenanceDate) : null,
      nextMaintenanceDate: amb.nextMaintenanceDate ? parseDate(amb.nextMaintenanceDate) : null,
      notes: amb.notes,
      createdAt: parseDate(amb.createdAt),
      updatedAt: parseDate(amb.updatedAt),
    };
  },

  getAvailable: () => {
    const ambulances = db.prepare("SELECT * FROM ambulances WHERE status = 'available' ORDER BY ambulanceNumber").all() as any[];
    return ambulances.map((amb) => ({
      $id: amb.id,
      ambulanceNumber: amb.ambulanceNumber,
      licensePlate: amb.licensePlate,
      status: amb.status,
      currentLocation: amb.currentLocation ? JSON.parse(amb.currentLocation) : null,
      crew: JSON.parse(amb.crew),
      equipment: JSON.parse(amb.equipment),
      lastMaintenanceDate: amb.lastMaintenanceDate ? parseDate(amb.lastMaintenanceDate) : null,
      nextMaintenanceDate: amb.nextMaintenanceDate ? parseDate(amb.nextMaintenanceDate) : null,
      notes: amb.notes,
      createdAt: parseDate(amb.createdAt),
      updatedAt: parseDate(amb.updatedAt),
    }));
  },

  updateStatus: (id: string, status: string) => {
    const now = new Date().toISOString();
    db.prepare("UPDATE ambulances SET status = ?, updatedAt = ? WHERE id = ?").run(status, now, id);
    return ambulanceHelpers.getById(id);
  },

  updateLocation: (id: string, location: { lat: number; lng: number; address: string }) => {
    const now = new Date().toISOString();
    db.prepare("UPDATE ambulances SET currentLocation = ?, updatedAt = ? WHERE id = ?").run(
      JSON.stringify(location),
      now,
      id
    );
    return ambulanceHelpers.getById(id);
  },
};

// Ambulance Mission Helpers
export const ambulanceMissionHelpers = {
  create: (mission: {
    ambulanceId: string;
    emergencyCaseId?: string;
    missionType: string;
    priority: number;
    callerName?: string;
    callerPhone: string;
    pickupLocation: { address: string; lat?: number; lng?: number };
    destinationLocation?: { address: string; lat?: number; lng?: number };
    patientName?: string;
    patientAge?: string;
    patientGender?: string;
    chiefComplaint: string;
    estimatedArrivalTime?: Date | string;
    estimatedReturnTime?: Date | string;
    dispatcherName: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    // Actualizează statusul ambulanței
    ambulanceHelpers.updateStatus(mission.ambulanceId, "on_mission");

    db.prepare(`
      INSERT INTO ambulance_missions (
        id, ambulanceId, emergencyCaseId, missionType, priority,
        callerName, callerPhone, pickupLocation, destinationLocation,
        patientName, patientAge, patientGender, chiefComplaint,
        estimatedArrivalTime, estimatedReturnTime, status,
        dispatchedAt, dispatcherName, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'dispatched', ?, ?, ?, ?, ?)
    `).run(
      id,
      mission.ambulanceId,
      mission.emergencyCaseId || null,
      mission.missionType,
      mission.priority,
      mission.callerName || null,
      mission.callerPhone,
      JSON.stringify(mission.pickupLocation),
      mission.destinationLocation ? JSON.stringify(mission.destinationLocation) : null,
      mission.patientName || null,
      mission.patientAge || null,
      mission.patientGender || null,
      mission.chiefComplaint,
      mission.estimatedArrivalTime ? formatDate(mission.estimatedArrivalTime) : null,
      mission.estimatedReturnTime ? formatDate(mission.estimatedReturnTime) : null,
      now,
      mission.dispatcherName,
      mission.notes || null,
      now,
      now
    );

    return ambulanceMissionHelpers.getById(id);
  },

  getById: (id: string) => {
    const mission = db.prepare(`
      SELECT m.*, a.*
      FROM ambulance_missions m
      LEFT JOIN ambulances a ON m.ambulanceId = a.id
      WHERE m.id = ?
    `).get(id) as any;

    if (!mission) return null;

    const emergencyCase = mission.emergencyCaseId
      ? emergencyHelpers.getById(mission.emergencyCaseId)
      : null;

    return {
      $id: mission.id,
      ambulanceId: mission.ambulanceId,
      emergencyCaseId: mission.emergencyCaseId || null,
      missionType: mission.missionType,
      priority: mission.priority,
      callerName: mission.callerName,
      callerPhone: mission.callerPhone,
      pickupLocation: JSON.parse(mission.pickupLocation),
      destinationLocation: mission.destinationLocation ? JSON.parse(mission.destinationLocation) : null,
      patientName: mission.patientName,
      patientAge: mission.patientAge,
      patientGender: mission.patientGender,
      chiefComplaint: mission.chiefComplaint,
      estimatedArrivalTime: mission.estimatedArrivalTime ? parseDate(mission.estimatedArrivalTime) : null,
      estimatedReturnTime: mission.estimatedReturnTime ? parseDate(mission.estimatedReturnTime) : null,
      status: mission.status,
      dispatchedAt: parseDate(mission.dispatchedAt),
      enRouteAt: mission.enRouteAt ? parseDate(mission.enRouteAt) : null,
      atSceneAt: mission.atSceneAt ? parseDate(mission.atSceneAt) : null,
      transportingAt: mission.transportingAt ? parseDate(mission.transportingAt) : null,
      atHospitalAt: mission.atHospitalAt ? parseDate(mission.atHospitalAt) : null,
      completedAt: mission.completedAt ? parseDate(mission.completedAt) : null,
      cancelledAt: mission.cancelledAt ? parseDate(mission.cancelledAt) : null,
      cancelledReason: mission.cancelledReason,
      dispatcherName: mission.dispatcherName,
      notes: mission.notes,
      createdAt: parseDate(mission.createdAt),
      updatedAt: parseDate(mission.updatedAt),
      ambulance: mission.ambulanceId ? {
        $id: mission.ambulanceId,
        ambulanceNumber: mission.ambulanceNumber,
        licensePlate: mission.licensePlate,
        status: mission.status,
        crew: JSON.parse(mission.crew),
      } : null,
      emergencyCase,
    };
  },

  getAll: () => {
    const missions = db.prepare(`
      SELECT m.*, a.ambulanceNumber, a.licensePlate, a.crew
      FROM ambulance_missions m
      LEFT JOIN ambulances a ON m.ambulanceId = a.id
      ORDER BY m.dispatchedAt DESC
    `).all() as any[];

    return missions.map((mission) => {
      const emergencyCase = mission.emergencyCaseId
        ? emergencyHelpers.getById(mission.emergencyCaseId)
        : null;

      return {
        $id: mission.id,
        ambulanceId: mission.ambulanceId,
        emergencyCaseId: mission.emergencyCaseId || null,
        missionType: mission.missionType,
        priority: mission.priority,
        callerName: mission.callerName,
        callerPhone: mission.callerPhone,
        pickupLocation: JSON.parse(mission.pickupLocation),
        destinationLocation: mission.destinationLocation ? JSON.parse(mission.destinationLocation) : null,
        patientName: mission.patientName,
        patientAge: mission.patientAge,
        patientGender: mission.patientGender,
        chiefComplaint: mission.chiefComplaint,
        estimatedArrivalTime: mission.estimatedArrivalTime ? parseDate(mission.estimatedArrivalTime) : null,
        estimatedReturnTime: mission.estimatedReturnTime ? parseDate(mission.estimatedReturnTime) : null,
        status: mission.status,
        dispatchedAt: parseDate(mission.dispatchedAt),
        enRouteAt: mission.enRouteAt ? parseDate(mission.enRouteAt) : null,
        atSceneAt: mission.atSceneAt ? parseDate(mission.atSceneAt) : null,
        transportingAt: mission.transportingAt ? parseDate(mission.transportingAt) : null,
        atHospitalAt: mission.atHospitalAt ? parseDate(mission.atHospitalAt) : null,
        completedAt: mission.completedAt ? parseDate(mission.completedAt) : null,
        cancelledAt: mission.cancelledAt ? parseDate(mission.cancelledAt) : null,
        cancelledReason: mission.cancelledReason,
        dispatcherName: mission.dispatcherName,
        notes: mission.notes,
        createdAt: parseDate(mission.createdAt),
        updatedAt: parseDate(mission.updatedAt),
        ambulance: {
          $id: mission.ambulanceId,
          ambulanceNumber: mission.ambulanceNumber,
          licensePlate: mission.licensePlate,
          crew: JSON.parse(mission.crew),
        },
        emergencyCase,
      };
    });
  },

  getActive: () => {
    const missions = db.prepare(`
      SELECT m.*, a.ambulanceNumber, a.licensePlate, a.crew
      FROM ambulance_missions m
      LEFT JOIN ambulances a ON m.ambulanceId = a.id
      WHERE m.status NOT IN ('completed', 'cancelled')
      ORDER BY m.priority ASC, m.dispatchedAt DESC
    `).all() as any[];

    return missions.map((mission) => {
      const emergencyCase = mission.emergencyCaseId
        ? emergencyHelpers.getById(mission.emergencyCaseId)
        : null;

      return {
        $id: mission.id,
        ambulanceId: mission.ambulanceId,
        emergencyCaseId: mission.emergencyCaseId || null,
        missionType: mission.missionType,
        priority: mission.priority,
        callerName: mission.callerName,
        callerPhone: mission.callerPhone,
        pickupLocation: JSON.parse(mission.pickupLocation),
        destinationLocation: mission.destinationLocation ? JSON.parse(mission.destinationLocation) : null,
        patientName: mission.patientName,
        patientAge: mission.patientAge,
        patientGender: mission.patientGender,
        chiefComplaint: mission.chiefComplaint,
        estimatedArrivalTime: mission.estimatedArrivalTime ? parseDate(mission.estimatedArrivalTime) : null,
        estimatedReturnTime: mission.estimatedReturnTime ? parseDate(mission.estimatedReturnTime) : null,
        status: mission.status,
        dispatchedAt: parseDate(mission.dispatchedAt),
        enRouteAt: mission.enRouteAt ? parseDate(mission.enRouteAt) : null,
        atSceneAt: mission.atSceneAt ? parseDate(mission.atSceneAt) : null,
        transportingAt: mission.transportingAt ? parseDate(mission.transportingAt) : null,
        atHospitalAt: mission.atHospitalAt ? parseDate(mission.atHospitalAt) : null,
        completedAt: mission.completedAt ? parseDate(mission.completedAt) : null,
        cancelledAt: mission.cancelledAt ? parseDate(mission.cancelledAt) : null,
        cancelledReason: mission.cancelledReason,
        dispatcherName: mission.dispatcherName,
        notes: mission.notes,
        createdAt: parseDate(mission.createdAt),
        updatedAt: parseDate(mission.updatedAt),
        ambulance: {
          $id: mission.ambulanceId,
          ambulanceNumber: mission.ambulanceNumber,
          licensePlate: mission.licensePlate,
          crew: JSON.parse(mission.crew),
        },
        emergencyCase,
      };
    });
  },

  updateStatus: (id: string, status: string, timestamp?: Date | string) => {
    const now = timestamp ? formatDate(timestamp) : new Date().toISOString();
    const mission = ambulanceMissionHelpers.getById(id);
    if (!mission) return null;

    let updateQuery = "UPDATE ambulance_missions SET status = ?, updatedAt = ?";
    const params: any[] = [status, now];

    // Actualizează timestamp-ul corespunzător statusului
    switch (status) {
      case "en_route":
        updateQuery += ", enRouteAt = ?";
        params.push(now);
        break;
      case "at_scene":
        updateQuery += ", atSceneAt = ?";
        params.push(now);
        break;
      case "transporting":
        updateQuery += ", transportingAt = ?";
        params.push(now);
        break;
      case "at_hospital":
        updateQuery += ", atHospitalAt = ?";
        params.push(now);
        // Când ambulanța ajunge la spital, actualizează statusul ambulanței
        ambulanceHelpers.updateStatus(mission.ambulanceId, "at_hospital");
        break;
      case "completed":
        updateQuery += ", completedAt = ?";
        params.push(now);
        // Când misiunea este completată, ambulanța devine disponibilă
        ambulanceHelpers.updateStatus(mission.ambulanceId, "available");
        break;
      case "cancelled":
        updateQuery += ", cancelledAt = ?";
        params.push(now);
        // Când misiunea este anulată, ambulanța devine disponibilă
        ambulanceHelpers.updateStatus(mission.ambulanceId, "available");
        break;
    }

    params.push(id);
    updateQuery += " WHERE id = ?";

    db.prepare(updateQuery).run(...params);

    // Dacă misiunea ajunge la spital și există un emergencyCaseId, cazul de urgență este deja creat
    // Dacă nu există emergencyCaseId, creează unul nou
    if (status === "at_hospital" && !mission.emergencyCaseId) {
      const emergencyCase = emergencyHelpers.create({
        patientName: mission.patientName || undefined,
        patientPhone: mission.callerPhone,
        patientAge: mission.patientAge || undefined,
        patientGender: mission.patientGender || undefined,
        triageLevel: mission.priority <= 3 ? "critic" : mission.priority <= 6 ? "urgent" : "normal",
        priority: mission.priority,
        chiefComplaint: mission.chiefComplaint,
      });

      // Actualizează misiunea cu emergencyCaseId
      if (emergencyCase) {
        db.prepare("UPDATE ambulance_missions SET emergencyCaseId = ? WHERE id = ?").run(emergencyCase.$id, id);
      }
    }

    return ambulanceMissionHelpers.getById(id);
  },

  cancel: (id: string, reason: string) => {
    const mission = ambulanceMissionHelpers.getById(id);
    if (!mission) return null;

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE ambulance_missions 
      SET status = 'cancelled', cancelledAt = ?, cancelledReason = ?, updatedAt = ?
      WHERE id = ?
    `).run(now, reason, now, id);

    // Ambulanța devine disponibilă
    ambulanceHelpers.updateStatus(mission.ambulanceId, "available");

    return ambulanceMissionHelpers.getById(id);
  },
};

// Medication Helpers
export const medicationHelpers = {
  getAll: () => {
    const medications = db.prepare("SELECT * FROM medications ORDER BY name").all() as any[];
    return medications.map((med) => ({
      $id: med.id,
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      unit: med.unit,
      dosageForm: med.dosageForm,
      strength: med.strength,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      expirationDate: med.expirationDate ? parseDate(med.expirationDate) : null,
      storageConditions: med.storageConditions,
      description: med.description,
      indications: med.indications ? JSON.parse(med.indications) : null,
      contraindications: med.contraindications ? JSON.parse(med.contraindications) : null,
      sideEffects: med.sideEffects ? JSON.parse(med.sideEffects) : null,
      createdAt: parseDate(med.createdAt),
      updatedAt: parseDate(med.updatedAt),
    }));
  },

  getById: (id: string) => {
    const med = db.prepare("SELECT * FROM medications WHERE id = ?").get(id) as any;
    if (!med) return null;
    return {
      $id: med.id,
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      unit: med.unit,
      dosageForm: med.dosageForm,
      strength: med.strength,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      expirationDate: med.expirationDate ? parseDate(med.expirationDate) : null,
      storageConditions: med.storageConditions,
      description: med.description,
      indications: med.indications ? JSON.parse(med.indications) : null,
      contraindications: med.contraindications ? JSON.parse(med.contraindications) : null,
      sideEffects: med.sideEffects ? JSON.parse(med.sideEffects) : null,
      createdAt: parseDate(med.createdAt),
      updatedAt: parseDate(med.updatedAt),
    };
  },

  getByCategory: (category: string) => {
    const medications = db.prepare("SELECT * FROM medications WHERE category = ? ORDER BY name").all(category) as any[];
    return medications.map((med) => ({
      $id: med.id,
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      unit: med.unit,
      dosageForm: med.dosageForm,
      strength: med.strength,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      expirationDate: med.expirationDate ? parseDate(med.expirationDate) : null,
      storageConditions: med.storageConditions,
      description: med.description,
      indications: med.indications ? JSON.parse(med.indications) : null,
      contraindications: med.contraindications ? JSON.parse(med.contraindications) : null,
      sideEffects: med.sideEffects ? JSON.parse(med.sideEffects) : null,
      createdAt: parseDate(med.createdAt),
      updatedAt: parseDate(med.updatedAt),
    }));
  },
};

// Medication Stock Helpers
export const medicationStockHelpers = {
  getAll: (location?: string) => {
    let query = `
      SELECT s.*, m.name, m.genericName, m.category, m.unit, m.dosageForm, m.strength
      FROM medication_stock s
      LEFT JOIN medications m ON s.medicationId = m.id
    `;
    const params: any[] = [];
    
    if (location) {
      query += " WHERE s.location = ?";
      params.push(location);
    }
    
    query += " ORDER BY m.name";
    
    const stocks = db.prepare(query).all(...params) as any[];
    return stocks.map((stock) => ({
      $id: stock.id,
      medicationId: stock.medicationId,
      location: stock.location,
      quantity: stock.quantity,
      reservedQuantity: stock.reservedQuantity,
      minimumStockLevel: stock.minimumStockLevel,
      maximumStockLevel: stock.maximumStockLevel,
      lastRestockedDate: stock.lastRestockedDate ? parseDate(stock.lastRestockedDate) : null,
      lastRestockedQuantity: stock.lastRestockedQuantity,
      notes: stock.notes,
      createdAt: parseDate(stock.createdAt),
      updatedAt: parseDate(stock.updatedAt),
      medication: stock.medicationId ? {
        $id: stock.medicationId,
        name: stock.name,
        genericName: stock.genericName,
        category: stock.category,
        unit: stock.unit,
        dosageForm: stock.dosageForm,
        strength: stock.strength,
      } : null,
      availableQuantity: stock.quantity - stock.reservedQuantity,
    }));
  },

  getById: (id: string) => {
    const stock = db.prepare(`
      SELECT s.*, m.name, m.genericName, m.category, m.unit, m.dosageForm, m.strength
      FROM medication_stock s
      LEFT JOIN medications m ON s.medicationId = m.id
      WHERE s.id = ?
    `).get(id) as any;
    
    if (!stock) return null;
    
    return {
      $id: stock.id,
      medicationId: stock.medicationId,
      location: stock.location,
      quantity: stock.quantity,
      reservedQuantity: stock.reservedQuantity,
      minimumStockLevel: stock.minimumStockLevel,
      maximumStockLevel: stock.maximumStockLevel,
      lastRestockedDate: stock.lastRestockedDate ? parseDate(stock.lastRestockedDate) : null,
      lastRestockedQuantity: stock.lastRestockedQuantity,
      notes: stock.notes,
      createdAt: parseDate(stock.createdAt),
      updatedAt: parseDate(stock.updatedAt),
      medication: {
        $id: stock.medicationId,
        name: stock.name,
        genericName: stock.genericName,
        category: stock.category,
        unit: stock.unit,
        dosageForm: stock.dosageForm,
        strength: stock.strength,
      },
      availableQuantity: stock.quantity - stock.reservedQuantity,
    };
  },

  getByMedicationId: (medicationId: string, location?: string) => {
    let query = `
      SELECT s.*, m.name, m.genericName, m.category, m.unit, m.dosageForm, m.strength
      FROM medication_stock s
      LEFT JOIN medications m ON s.medicationId = m.id
      WHERE s.medicationId = ?
    `;
    const params: any[] = [medicationId];
    
    if (location) {
      query += " AND s.location = ?";
      params.push(location);
    }
    
    const stocks = db.prepare(query).all(...params) as any[];
    return stocks.map((stock) => ({
      $id: stock.id,
      medicationId: stock.medicationId,
      location: stock.location,
      quantity: stock.quantity,
      reservedQuantity: stock.reservedQuantity,
      minimumStockLevel: stock.minimumStockLevel,
      maximumStockLevel: stock.maximumStockLevel,
      lastRestockedDate: stock.lastRestockedDate ? parseDate(stock.lastRestockedDate) : null,
      lastRestockedQuantity: stock.lastRestockedQuantity,
      notes: stock.notes,
      createdAt: parseDate(stock.createdAt),
      updatedAt: parseDate(stock.updatedAt),
      medication: {
        $id: stock.medicationId,
        name: stock.name,
        genericName: stock.genericName,
        category: stock.category,
        unit: stock.unit,
        dosageForm: stock.dosageForm,
        strength: stock.strength,
      },
      availableQuantity: stock.quantity - stock.reservedQuantity,
    }));
  },

  getAvailableForLocation: (location: string) => {
    const stocks = db.prepare(`
      SELECT s.*, m.name, m.genericName, m.category, m.unit, m.dosageForm, m.strength
      FROM medication_stock s
      LEFT JOIN medications m ON s.medicationId = m.id
      WHERE s.location = ? AND (s.quantity - s.reservedQuantity) > 0
      ORDER BY m.name
    `).all(location) as any[];
    
    return stocks.map((stock) => ({
      $id: stock.id,
      medicationId: stock.medicationId,
      location: stock.location,
      quantity: stock.quantity,
      reservedQuantity: stock.reservedQuantity,
      minimumStockLevel: stock.minimumStockLevel,
      maximumStockLevel: stock.maximumStockLevel,
      lastRestockedDate: stock.lastRestockedDate ? parseDate(stock.lastRestockedDate) : null,
      lastRestockedQuantity: stock.lastRestockedQuantity,
      notes: stock.notes,
      createdAt: parseDate(stock.createdAt),
      updatedAt: parseDate(stock.updatedAt),
      medication: {
        $id: stock.medicationId,
        name: stock.name,
        genericName: stock.genericName,
        category: stock.category,
        unit: stock.unit,
        dosageForm: stock.dosageForm,
        strength: stock.strength,
      },
      availableQuantity: stock.quantity - stock.reservedQuantity,
    }));
  },

  getLowStock: (location?: string) => {
    let query = `
      SELECT s.*, m.name, m.genericName, m.category, m.unit, m.dosageForm, m.strength
      FROM medication_stock s
      LEFT JOIN medications m ON s.medicationId = m.id
      WHERE (s.quantity - s.reservedQuantity) <= s.minimumStockLevel
    `;
    const params: any[] = [];
    
    if (location) {
      query += " AND s.location = ?";
      params.push(location);
    }
    
    query += " ORDER BY (s.quantity - s.reservedQuantity) ASC, m.name";
    
    const stocks = db.prepare(query).all(...params) as any[];
    return stocks.map((stock) => ({
      $id: stock.id,
      medicationId: stock.medicationId,
      location: stock.location,
      quantity: stock.quantity,
      reservedQuantity: stock.reservedQuantity,
      minimumStockLevel: stock.minimumStockLevel,
      maximumStockLevel: stock.maximumStockLevel,
      lastRestockedDate: stock.lastRestockedDate ? parseDate(stock.lastRestockedDate) : null,
      lastRestockedQuantity: stock.lastRestockedQuantity,
      notes: stock.notes,
      createdAt: parseDate(stock.createdAt),
      updatedAt: parseDate(stock.updatedAt),
      medication: {
        $id: stock.medicationId,
        name: stock.name,
        genericName: stock.genericName,
        category: stock.category,
        unit: stock.unit,
        dosageForm: stock.dosageForm,
        strength: stock.strength,
      },
      availableQuantity: stock.quantity - stock.reservedQuantity,
    }));
  },

  updateQuantity: (id: string, quantity: number, reservedQuantity?: number) => {
    const now = new Date().toISOString();
    if (reservedQuantity !== undefined) {
      db.prepare(`
        UPDATE medication_stock 
        SET quantity = ?, reservedQuantity = ?, updatedAt = ?
        WHERE id = ?
      `).run(quantity, reservedQuantity, now, id);
    } else {
      db.prepare(`
        UPDATE medication_stock 
        SET quantity = ?, updatedAt = ?
        WHERE id = ?
      `).run(quantity, now, id);
    }
    return medicationStockHelpers.getById(id);
  },

  reserveQuantity: (id: string, quantity: number) => {
    const stock = medicationStockHelpers.getById(id);
    if (!stock) return null;
    
    if (stock.availableQuantity < quantity) {
      throw new Error(`Stoc insuficient. Disponibil: ${stock.availableQuantity}, Cerut: ${quantity}`);
    }
    
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE medication_stock 
      SET reservedQuantity = reservedQuantity + ?, updatedAt = ?
      WHERE id = ?
    `).run(quantity, now, id);
    
    return medicationStockHelpers.getById(id);
  },

  releaseReservation: (id: string, quantity: number) => {
    const stock = medicationStockHelpers.getById(id);
    if (!stock) return null;
    
    const now = new Date().toISOString();
    const newReserved = Math.max(0, stock.reservedQuantity - quantity);
    db.prepare(`
      UPDATE medication_stock 
      SET reservedQuantity = ?, updatedAt = ?
      WHERE id = ?
    `).run(newReserved, now, id);
    
    return medicationStockHelpers.getById(id);
  },

  consumeQuantity: (id: string, quantity: number) => {
    const stock = medicationStockHelpers.getById(id);
    if (!stock) return null;
    
    if (stock.quantity < quantity) {
      throw new Error(`Stoc insuficient. Disponibil: ${stock.quantity}, Cerut: ${quantity}`);
    }
    
    const now = new Date().toISOString();
    const newReserved = Math.max(0, stock.reservedQuantity - quantity);
    db.prepare(`
      UPDATE medication_stock 
      SET quantity = quantity - ?, reservedQuantity = ?, updatedAt = ?
      WHERE id = ?
    `).run(quantity, newReserved, now, id);
    
    return medicationStockHelpers.getById(id);
  },

  restock: (id: string, quantity: number) => {
    const stock = medicationStockHelpers.getById(id);
    if (!stock) return null;
    
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE medication_stock 
      SET quantity = quantity + ?, lastRestockedDate = ?, lastRestockedQuantity = ?, updatedAt = ?
      WHERE id = ?
    `).run(quantity, now, quantity, now, id);
    
    return medicationStockHelpers.getById(id);
  },
};

// Medication Transaction Helpers
export const medicationTransactionHelpers = {
  create: (transaction: {
    medicationId: string;
    stockId: string;
    transactionType: string;
    quantity: number;
    reason?: string;
    performedBy: string;
    relatedTo?: string;
    relatedId?: string;
    notes?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO medication_transactions (
        id, medicationId, stockId, transactionType, quantity, reason,
        performedBy, relatedTo, relatedId, notes, transactionDate, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      transaction.medicationId,
      transaction.stockId,
      transaction.transactionType,
      transaction.quantity,
      transaction.reason || null,
      transaction.performedBy,
      transaction.relatedTo || null,
      transaction.relatedId || null,
      transaction.notes || null,
      now,
      now
    );
    
    return medicationTransactionHelpers.getById(id);
  },

  getById: (id: string) => {
    const trans = db.prepare(`
      SELECT t.*, m.name as medicationName, m.unit as medicationUnit
      FROM medication_transactions t
      LEFT JOIN medications m ON t.medicationId = m.id
      WHERE t.id = ?
    `).get(id) as any;
    
    if (!trans) return null;
    
    return {
      $id: trans.id,
      medicationId: trans.medicationId,
      stockId: trans.stockId,
      transactionType: trans.transactionType,
      quantity: trans.quantity,
      reason: trans.reason,
      performedBy: trans.performedBy,
      relatedTo: trans.relatedTo,
      relatedId: trans.relatedId,
      notes: trans.notes,
      transactionDate: parseDate(trans.transactionDate),
      createdAt: parseDate(trans.createdAt),
      medication: {
        $id: trans.medicationId,
        name: trans.medicationName,
        unit: trans.medicationUnit,
      },
    };
  },

  getAll: (medicationId?: string, stockId?: string) => {
    let query = `
      SELECT t.*, m.name as medicationName, m.unit as medicationUnit
      FROM medication_transactions t
      LEFT JOIN medications m ON t.medicationId = m.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (medicationId) {
      query += " AND t.medicationId = ?";
      params.push(medicationId);
    }
    
    if (stockId) {
      query += " AND t.stockId = ?";
      params.push(stockId);
    }
    
    query += " ORDER BY t.transactionDate DESC";
    
    const transactions = db.prepare(query).all(...params) as any[];
    return transactions.map((trans) => ({
      $id: trans.id,
      medicationId: trans.medicationId,
      stockId: trans.stockId,
      transactionType: trans.transactionType,
      quantity: trans.quantity,
      reason: trans.reason,
      performedBy: trans.performedBy,
      relatedTo: trans.relatedTo,
      relatedId: trans.relatedId,
      notes: trans.notes,
      transactionDate: parseDate(trans.transactionDate),
      createdAt: parseDate(trans.createdAt),
      medication: {
        $id: trans.medicationId,
        name: trans.medicationName,
        unit: trans.medicationUnit,
      },
    }));
  },
};

// Medical Document Helpers
// Doctor Review Helpers
export const doctorReviewHelpers = {
  create: (review: {
    appointmentId: string;
    patientId: string;
    doctorName: string;
    rating: number;
    comment?: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO doctor_reviews (id, appointmentId, patientId, doctorName, rating, comment, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, review.appointmentId, review.patientId, review.doctorName, review.rating, review.comment || null, now);

    return doctorReviewHelpers.getById(id);
  },

  getById: (id: string) => {
    const r = db.prepare("SELECT * FROM doctor_reviews WHERE id = ?").get(id) as any;
    if (!r) return null;
    return {
      $id: r.id,
      appointmentId: r.appointmentId,
      patientId: r.patientId,
      doctorName: r.doctorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: parseDate(r.createdAt),
    } as DoctorReview;
  },

  getByAppointmentId: (appointmentId: string) => {
    const r = db.prepare("SELECT * FROM doctor_reviews WHERE appointmentId = ?").get(appointmentId) as any;
    if (!r) return null;
    return {
      $id: r.id,
      appointmentId: r.appointmentId,
      patientId: r.patientId,
      doctorName: r.doctorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: parseDate(r.createdAt),
    } as DoctorReview;
  },

  getByPatientId: (patientId: string) => {
    const reviews = db.prepare(`
      SELECT * FROM doctor_reviews WHERE patientId = ? ORDER BY createdAt DESC
    `).all(patientId) as any[];

    return reviews.map((r) => ({
      $id: r.id,
      appointmentId: r.appointmentId,
      patientId: r.patientId,
      doctorName: r.doctorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: parseDate(r.createdAt),
    })) as DoctorReview[];
  },

  getByDoctorName: (doctorName: string) => {
    const reviews = db.prepare(`
      SELECT * FROM doctor_reviews WHERE doctorName = ? ORDER BY createdAt DESC
    `).all(doctorName) as any[];

    return reviews.map((r) => ({
      $id: r.id,
      appointmentId: r.appointmentId,
      patientId: r.patientId,
      doctorName: r.doctorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: parseDate(r.createdAt),
    })) as DoctorReview[];
  },

  getAverageRating: (doctorName: string): { average: number; count: number } => {
    const result = db.prepare(`
      SELECT AVG(rating) as average, COUNT(*) as count
      FROM doctor_reviews WHERE doctorName = ?
    `).get(doctorName) as any;

    return {
      average: result.average ? Math.round(result.average * 10) / 10 : 0,
      count: result.count || 0,
    };
  },

  getAllAverageRatings: (): Record<string, { average: number; count: number }> => {
    const results = db.prepare(`
      SELECT doctorName, AVG(rating) as average, COUNT(*) as count
      FROM doctor_reviews GROUP BY doctorName
    `).all() as any[];

    const ratings: Record<string, { average: number; count: number }> = {};
    results.forEach((r) => {
      ratings[r.doctorName] = {
        average: r.average ? Math.round(r.average * 10) / 10 : 0,
        count: r.count || 0,
      };
    });
    return ratings;
  },
};

export const medicalDocumentHelpers = {
  create: (document: {
    patientId: string;
    appointmentId?: string;
    documentType: string;
    category?: string;
    fileName: string;
    originalFileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    description?: string;
    tags?: string[];
    uploadedBy: string;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO medical_documents (
        id, patientId, appointmentId, documentType, category, fileName, originalFileName,
        filePath, fileSize, mimeType, description, tags, uploadedBy, uploadedAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      document.patientId,
      document.appointmentId || null,
      document.documentType,
      document.category || null,
      document.fileName,
      document.originalFileName,
      document.filePath,
      document.fileSize,
      document.mimeType,
      document.description || null,
      document.tags ? JSON.stringify(document.tags) : null,
      document.uploadedBy,
      now,
      now,
      now
    );
    
    return medicalDocumentHelpers.getById(id);
  },

  getById: (id: string) => {
    const doc = db.prepare(`
      SELECT d.*, p.name as patientName
      FROM medical_documents d
      LEFT JOIN patients p ON d.patientId = p.id
      WHERE d.id = ? AND d.isDeleted = 0
    `).get(id) as any;
    
    if (!doc) return null;
    
    return {
      $id: doc.id,
      patientId: doc.patientId,
      appointmentId: doc.appointmentId,
      documentType: doc.documentType,
      category: doc.category,
      fileName: doc.fileName,
      originalFileName: doc.originalFileName,
      filePath: doc.filePath,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      description: doc.description,
      tags: doc.tags ? JSON.parse(doc.tags) : null,
      uploadedBy: doc.uploadedBy,
      uploadedAt: parseDate(doc.uploadedAt),
      isApproved: doc.isApproved === 1,
      approvedBy: doc.approvedBy,
      approvedAt: doc.approvedAt ? parseDate(doc.approvedAt) : null,
      version: doc.version,
      parentDocumentId: doc.parentDocumentId,
      isDeleted: doc.isDeleted === 1,
      deletedAt: doc.deletedAt ? parseDate(doc.deletedAt) : null,
      deletedBy: doc.deletedBy,
      createdAt: parseDate(doc.createdAt),
      updatedAt: parseDate(doc.updatedAt),
      patient: doc.patientName ? { name: doc.patientName } : null,
    };
  },

  getByPatientId: (patientId: string, filters?: {
    documentType?: string;
    category?: string;
    appointmentId?: string;
  }) => {
    let query = `
      SELECT d.*, p.name as patientName
      FROM medical_documents d
      LEFT JOIN patients p ON d.patientId = p.id
      WHERE d.patientId = ? AND d.isDeleted = 0
    `;
    const params: any[] = [patientId];
    
    if (filters?.documentType) {
      query += " AND d.documentType = ?";
      params.push(filters.documentType);
    }
    
    if (filters?.category) {
      query += " AND d.category = ?";
      params.push(filters.category);
    }
    
    if (filters?.appointmentId) {
      query += " AND d.appointmentId = ?";
      params.push(filters.appointmentId);
    }
    
    query += " ORDER BY d.uploadedAt DESC";
    
    const docs = db.prepare(query).all(...params) as any[];
    return docs.map((doc) => ({
      $id: doc.id,
      patientId: doc.patientId,
      appointmentId: doc.appointmentId,
      documentType: doc.documentType,
      category: doc.category,
      fileName: doc.fileName,
      originalFileName: doc.originalFileName,
      filePath: doc.filePath,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      description: doc.description,
      tags: doc.tags ? JSON.parse(doc.tags) : null,
      uploadedBy: doc.uploadedBy,
      uploadedAt: parseDate(doc.uploadedAt),
      isApproved: doc.isApproved === 1,
      approvedBy: doc.approvedBy,
      approvedAt: doc.approvedAt ? parseDate(doc.approvedAt) : null,
      version: doc.version,
      parentDocumentId: doc.parentDocumentId,
      isDeleted: doc.isDeleted === 1,
      deletedAt: doc.deletedAt ? parseDate(doc.deletedAt) : null,
      deletedBy: doc.deletedBy,
      createdAt: parseDate(doc.createdAt),
      updatedAt: parseDate(doc.updatedAt),
      patient: doc.patientName ? { name: doc.patientName } : null,
    }));
  },

  update: (id: string, updates: {
    description?: string;
    tags?: string[];
    category?: string;
  }) => {
    const now = new Date().toISOString();
    const updatesList: string[] = [];
    const params: any[] = [];
    
    if (updates.description !== undefined) {
      updatesList.push("description = ?");
      params.push(updates.description || null);
    }
    
    if (updates.tags !== undefined) {
      updatesList.push("tags = ?");
      params.push(updates.tags ? JSON.stringify(updates.tags) : null);
    }
    
    if (updates.category !== undefined) {
      updatesList.push("category = ?");
      params.push(updates.category || null);
    }
    
    if (updatesList.length > 0) {
      updatesList.push("updatedAt = ?");
      params.push(now);
      params.push(id);
      
      db.prepare(`
        UPDATE medical_documents 
        SET ${updatesList.join(", ")}
        WHERE id = ?
      `).run(...params);
    }
    
    return medicalDocumentHelpers.getById(id);
  },

  approve: (id: string, approvedBy: string) => {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE medical_documents 
      SET isApproved = 1, approvedBy = ?, approvedAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(approvedBy, now, now, id);
    
    return medicalDocumentHelpers.getById(id);
  },

  delete: (id: string, deletedBy: string) => {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE medical_documents 
      SET isDeleted = 1, deletedBy = ?, deletedAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(deletedBy, now, now, id);
    
    return medicalDocumentHelpers.getById(id);
  },

  logAccess: (documentId: string, accessedBy: string, accessType: string, ipAddress?: string, userAgent?: string) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO document_access_log (
        id, documentId, accessedBy, accessType, accessedAt, ipAddress, userAgent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      documentId,
      accessedBy,
      accessType,
      now,
      ipAddress || null,
      userAgent || null
    );
  },

  getAccessLog: (documentId: string) => {
    const logs = db.prepare(`
      SELECT * FROM document_access_log
      WHERE documentId = ?
      ORDER BY accessedAt DESC
      LIMIT 100
    `).all(documentId) as any[];
    
    return logs.map((log) => ({
      $id: log.id,
      documentId: log.documentId,
      accessedBy: log.accessedBy,
      accessType: log.accessType,
      accessedAt: parseDate(log.accessedAt),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    }));
  },
};
