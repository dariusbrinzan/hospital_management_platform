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
    patientId: string;
    triageLevel: "critic" | "urgent" | "normal";
    chiefComplaint: string;
    priority: number;
    vitalSigns?: any;
  }) => {
    const id = generateId();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO emergency_cases (
        id, patientId, triageLevel, currentState, priority, chiefComplaint,
        vitalSigns, arrivalTime, createdAt, updatedAt
      ) VALUES (?, ?, ?, 'arrival', ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      emergencyCase.patientId,
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
      JOIN patients p ON e.patientId = p.id
      ORDER BY e.priority ASC, e.arrivalTime DESC
    `).all() as any[];

    return cases.map(c => ({
      $id: c.id,
      patientId: c.patientId,
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
      patient: {
        $id: c.patient_id,
        name: c.patient_name,
        email: c.patient_email,
        phone: c.patient_phone,
        birthDate: parseDate(c.patient_birthDate),
        gender: c.patient_gender,
      },
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
      JOIN patients p ON e.patientId = p.id
      WHERE e.id = ?
    `).get(id) as any;

    if (!c) return null;

    return {
      $id: c.id,
      patientId: c.patientId,
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
      patient: {
        $id: c.patient_id,
        name: c.patient_name,
        email: c.patient_email,
        phone: c.patient_phone,
        birthDate: parseDate(c.patient_birthDate),
        gender: c.patient_gender,
      },
    };
  },

  updateState: (id: string, newState: "arrival" | "triage" | "consent" | "admission" | "treatment" | "discharge", performedBy: string, skipReason?: string) => {
    const now = new Date().toISOString();
    const caseData = emergencyHelpers.getById(id);
    if (!caseData) return null;

    // Validare tranziții
    const validTransitions: Record<string, string[]> = {
      arrival: ["triage"],
      triage: ["consent", "admission"],
      consent: ["admission", "treatment"],
      admission: ["treatment"],
      treatment: ["discharge"],
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
    emergencyHelpers.addStateTransition(id, caseData.currentState as "arrival" | "triage" | "consent" | "admission" | "treatment" | "discharge", newState, skipReason || "Tranziție normală", performedBy);

    return emergencyHelpers.getById(id);
  },

  assignDoctor: (id: string, doctorId: string) => {
    const now = new Date().toISOString();
    db.prepare(`UPDATE emergency_cases SET assignedDoctorId = ?, updatedAt = ? WHERE id = ?`).run(doctorId, now, id);
    return emergencyHelpers.getById(id);
  },

  addStateTransition: (emergencyCaseId: string, fromState: "arrival" | "triage" | "consent" | "admission" | "treatment" | "discharge", toState: "arrival" | "triage" | "consent" | "admission" | "treatment" | "discharge", reason: string, performedBy: string, metadata?: any) => {
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
