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
