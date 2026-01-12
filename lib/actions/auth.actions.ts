"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { userHelpers, patientHelpers } from "../db-helpers";
import { parseStringify } from "../utils";

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
