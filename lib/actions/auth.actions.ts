"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { userHelpers, patientHelpers, doctorAccessCodesHelpers } from "../db-helpers";
import { parseStringify } from "../utils";

const DOCTOR_SESSION_COOKIE = "doctor_session";
const ADMIN_SESSION_COOKIE = "admin_session";
/** Parola administrator: întotdeauna 0000 (4 cifre). */
const ADMIN_PASSKEY = "0000";

// LOGIN PATIENT
export const loginPatient = async (email: string, password: string) => {
  try {
    const bcrypt = await import("bcryptjs");
    
    // Verifică dacă utilizatorul există
    const user = userHelpers.getByEmail(email);
    
    if (!user) {
      return { error: "Email sau parolă incorectă" };
    }

    // Verifică dacă parola se potrivește
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { error: "Email sau parolă incorectă" };
    }

    // Setează cookie-ul de sesiune (chiar dacă pacientul nu este complet înregistrat)
    const cookieStore = await cookies();
    cookieStore.set("patient_session", user.$id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 zile
    });

    // Verifică dacă pacientul există (este înregistrat complet)
    const patient = patientHelpers.getByUserId(user.$id);
    
    if (!patient) {
      // Dacă pacientul nu există, returnează success dar cu flag pentru redirect la register
      return { success: true, userId: user.$id, needsRegistration: true };
    }

    return { success: true, userId: user.$id, needsRegistration: false };
  } catch (error) {
    console.error("An error occurred while logging in:", error);
    return { error: "A apărut o eroare la autentificare" };
  }
};

// LOGOUT PATIENT
export const logoutPatient = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("patient_session");
    return { success: true };
  } catch (error) {
    console.error("An error occurred while logging out:", error);
    return { error: "A apărut o eroare la deconectare" };
  }
};

// GET CURRENT SESSION
export const getCurrentSession = async () => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("patient_session")?.value;

    if (!sessionId) {
      return null;
    }

    const user = userHelpers.getById(sessionId);
    if (!user) {
      // Șterge cookie-ul dacă utilizatorul nu există
      cookieStore.delete("patient_session");
      return null;
    }

    return parseStringify(user);
  } catch (error) {
    console.error("An error occurred while getting session:", error);
    return null;
  }
};

// SET SESSION AFTER REGISTRATION
export const setSessionAfterRegistration = async (userId: string) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set("patient_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 zile
    });
    return { success: true };
  } catch (error) {
    console.error("An error occurred while setting session:", error);
    return { error: "A apărut o eroare la setarea sesiunii" };
  }
};

// VERIFY SESSION AND REDIRECT IF NOT AUTHENTICATED
export const requireAuth = async () => {
  const session = await getCurrentSession();
  
  if (!session) {
    redirect("/");
  }
  
  return session;
};

// ─── LOGIN MEDIC (cod 4 cifre) ─────────────────────────────────────────────

export const loginDoctor = async (code: string) => {
  try {
    doctorAccessCodesHelpers.seedIfEmpty();
    const row = doctorAccessCodesHelpers.getByCode(code);
    if (!row) {
      return { error: "Cod invalid. Introduceți codul de 4 cifre alocat." };
    }
    const cookieStore = await cookies();
    // Nu ștergem admin_session – permitem două tab-uri: unul medic, unul admin
    cookieStore.set(DOCTOR_SESSION_COOKIE, row.doctor_name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 ore
    });
    return { success: true, doctorName: row.doctor_name };
  } catch (error) {
    console.error("Doctor login error:", error);
    return { error: "A apărut o eroare la autentificare." };
  }
};

export const getDoctorSession = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    const doctorName = cookieStore.get(DOCTOR_SESSION_COOKIE)?.value;
    return doctorName ?? null;
  } catch {
    return null;
  }
};

export const logoutDoctor = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(DOCTOR_SESSION_COOKIE);
    return { success: true };
  } catch (error) {
    console.error("Doctor logout error:", error);
    return { error: "A apărut o eroare la deconectare." };
  }
};

// ─── LOGIN ADMINISTRATOR (parolă 0000 – strict roluri administrative) ─────

export const loginAdmin = async (passkey: string): Promise<{ success?: boolean; error?: string }> => {
  try {
    const digits = String(passkey ?? "").replace(/\D/g, "");
    if (digits !== "0000") {
      return { error: "Parolă invalidă. Accesul este rezervat administratorului." };
    }
    const cookieStore = await cookies();
    // Nu ștergem doctor_session – permitem două tab-uri: unul medic, unul admin
    cookieStore.set(ADMIN_SESSION_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 ore
    });
    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { error: "A apărut o eroare la autentificare." };
  }
};

export const getAdminSession = async (): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    return value === "1";
  } catch {
    return false;
  }
};

export const logoutAdmin = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return { success: true };
  } catch (error) {
    console.error("Admin logout error:", error);
    return { error: "A apărut o eroare la deconectare." };
  }
};

/** Redirect la /?admin=true dacă nu există sesiune administrator. Folosit pe rutele doar pentru admin. */
export const requireAdmin = async () => {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/?admin=true");
};
