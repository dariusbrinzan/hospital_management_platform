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
