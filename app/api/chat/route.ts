import { NextRequest, NextResponse } from "next/server";
import { getReply, type ChatContext } from "@/lib/chatbot-rules";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import { getPatientAppointments } from "@/lib/actions/appointment.actions";
import { getUserNotifications, getUnreadNotificationCount } from "@/lib/actions/notification.actions";
import {
  medicalRecordHelpers,
  prescriptionHelpers,
  labResultHelpers,
  allergyHelpers,
  vaccinationHelpers,
  vitalSignsHelpers,
} from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";

async function buildDynamicReply(
  dynamicIntent: string,
  userId: string,
  context?: ChatContext
): Promise<string> {
  const patient = await getPatient(userId);
  if (!patient) {
    return "Nu am găsit profilul tău de pacient. Te rog să te autentifici sau să îți creezi un profil.";
  }

  const patientId = (patient as any).$id || (patient as any).id;

  switch (dynamicIntent) {
    case "upcoming_appointments": {
      const appointments = await getPatientAppointments(userId);
      const upcoming = (appointments?.upcoming || [])
        .filter((apt: any) => apt.status !== "cancelled")
        .sort((a: any, b: any) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime())
        .slice(0, 5);

      if (upcoming.length === 0) {
        return "Nu ai programări viitoare. Poți face o programare nouă din Dashboard → \"Programare nouă\".";
      }

      let reply = `Ai ${upcoming.length} programări viitoare:\n\n`;
      upcoming.forEach((apt: any, idx: number) => {
        const dateTime = formatDateTime(apt.schedule).dateTime;
        reply += `${idx + 1}. ${dateTime} - Dr. ${apt.primaryPhysician}`;
        if (apt.reason) reply += ` (${apt.reason})`;
        reply += `\n`;
      });
      reply += `\nPentru detalii, anulare sau reprogramare, mergi în Dashboard.`;
      return reply;
    }

    case "recent_medical_history": {
      const records = medicalRecordHelpers.getByPatientId(patientId).slice(0, 5);
      if (records.length === 0) {
        return "Nu ai consultații înregistrate încă. Istoricul tău medical va apărea aici după prima consultație.";
      }

      let reply = `Ultimele ${records.length} consultații:\n\n`;
      records.forEach((record: any, idx: number) => {
        const date = formatDateTime(record.visitDate).dateOnly;
        reply += `${idx + 1}. ${date} - Dr. ${record.doctorName}`;
        if (record.chiefComplaint) reply += `\n   Motive: ${record.chiefComplaint}`;
        if (record.assessment) reply += `\n   Diagnostic: ${record.assessment}`;
        reply += `\n`;
      });
      reply += `\nVezi toate consultațiile în Istoric Medical.`;
      return reply;
    }

    case "active_medications": {
      const prescriptions = prescriptionHelpers.getActiveByPatientId(patientId);
      if (prescriptions.length === 0) {
        return "Nu ai medicamente active în acest moment. Rețetele active apar aici după consultații.";
      }

      let reply = `Medicamente active (${prescriptions.length}):\n\n`;
      prescriptions.forEach((rx: any, idx: number) => {
        reply += `${idx + 1}. ${rx.medicationName}`;
        if (rx.dosage) reply += ` - ${rx.dosage}`;
        if (rx.frequency) reply += `, ${rx.frequency}`;
        if (rx.startDate) {
          const start = formatDateTime(rx.startDate).dateOnly;
          reply += `\n   Început: ${start}`;
        }
        if (rx.endDate) {
          const end = formatDateTime(rx.endDate).dateOnly;
          reply += `, până: ${end}`;
        }
        reply += `\n`;
      });
      reply += `\nPentru detalii complete, vezi Profil Medical → Medicație curentă.`;
      return reply;
    }

    case "recent_lab_results": {
      const results = labResultHelpers.getByPatientId(patientId).slice(0, 5);
      if (results.length === 0) {
        return "Nu ai rezultate de analize încă. Rezultatele vor apărea aici după ce sunt înregistrate.";
      }

      let reply = `Rezultate analize recente (${results.length}):\n\n`;
      results.forEach((result: any, idx: number) => {
        const date = formatDateTime(result.performedDate).dateOnly;
        reply += `${idx + 1}. ${result.testName} (${date})`;
        if (result.resultValue) reply += `: ${result.resultValue}`;
        if (result.unit) reply += ` ${result.unit}`;
        if (result.status) reply += ` - ${result.status}`;
        reply += `\n`;
      });
      reply += `\nVezi toate rezultatele în Istoric Medical.`;
      return reply;
    }

    case "unread_notifications": {
      const unreadCount = await getUnreadNotificationCount(userId);
      if (unreadCount === 0) {
        return "Nu ai notificări necitite. Toate notificările tale sunt disponibile în Dashboard.";
      }

      const notifications = await getUserNotifications(userId, 5);
      const unread = notifications.filter((n: any) => !n.isRead).slice(0, 5);

      let reply = `Ai ${unreadCount} notificări necitite:\n\n`;
      unread.forEach((notif: any, idx: number) => {
        reply += `${idx + 1}. ${notif.title}`;
        if (notif.message) reply += `\n   ${notif.message}`;
        reply += `\n`;
      });
      reply += `\nVezi toate notificările în Dashboard.`;
      return reply;
    }

    case "allergies": {
      const allergies = allergyHelpers.getByPatientId(patientId);
      if (allergies.length === 0) {
        return "Nu ai alergii înregistrate. Poți adăuga alergii din Profil Medical → Alergii.";
      }

      let reply = `Alergii înregistrate (${allergies.length}):\n\n`;
      allergies.forEach((allergy: any, idx: number) => {
        reply += `${idx + 1}. ${allergy.allergenType}`;
        if (allergy.allergenName) reply += `: ${allergy.allergenName}`;
        if (allergy.severity) reply += ` (${allergy.severity})`;
        if (allergy.reaction) reply += `\n   Reacție: ${allergy.reaction}`;
        reply += `\n`;
      });
      reply += `\nPentru actualizări, mergi în Profil Medical → Alergii.`;
      return reply;
    }

    case "recent_vaccinations": {
      const vaccinations = vaccinationHelpers.getByPatientId(patientId).slice(0, 5);
      if (vaccinations.length === 0) {
        return "Nu ai vaccinări înregistrate. Vaccinările tale vor apărea aici după ce sunt înregistrate.";
      }

      let reply = `Vaccinări recente (${vaccinations.length}):\n\n`;
      vaccinations.forEach((vac: any, idx: number) => {
        const date = formatDateTime(vac.administrationDate).dateOnly;
        reply += `${idx + 1}. ${vac.vaccineName} - ${date}`;
        if (vac.nextDoseDate) {
          const next = formatDateTime(vac.nextDoseDate).dateOnly;
          reply += `\n   Următoarea doză: ${next}`;
        }
        reply += `\n`;
      });
      reply += `\nVezi toate vaccinările în Istoric Medical sau Profil Medical.`;
      return reply;
    }

    case "vital_signs": {
      const vitals = vitalSignsHelpers.getByPatientId(patientId).slice(0, 3);
      if (vitals.length === 0) {
        return "Nu ai semne vitale înregistrate încă. Acestea se înregistrează la fiecare consultație.";
      }

      let reply = `Semne vitale recente:\n\n`;
      vitals.forEach((vital: any, idx: number) => {
        const date = formatDateTime(vital.recordedAt).dateTime;
        reply += `${idx + 1}. ${date}:\n`;
        if (vital.bloodPressure) reply += `   Tensiune: ${vital.bloodPressure}\n`;
        if (vital.heartRate) reply += `   Puls: ${vital.heartRate} bpm\n`;
        if (vital.temperature) reply += `   Temperatură: ${vital.temperature}°C\n`;
        if (vital.weight) reply += `   Greutate: ${vital.weight} kg\n`;
        if (vital.height) reply += `   Înălțime: ${vital.height} cm\n`;
        reply += `\n`;
      });
      reply += `Vezi toate semnele vitale în Istoric Medical.`;
      return reply;
    }

    default:
      return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const context: ChatContext | undefined = body.context;

    if (!message) {
      return NextResponse.json(
        { reply: "Scrie ceva și îți răspund." },
        { status: 200 }
      );
    }

    const { reply: baseReply, dynamicIntent } = getReply(message, context);

    // Dacă nu există intenție dinamică sau utilizatorul nu este autentificat, returnează răspunsul de bază
    if (!dynamicIntent) {
      return NextResponse.json({ reply: baseReply });
    }

    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({
        reply: baseReply + "\n\nPentru a vedea datele tale, te rog să te autentifici.",
      });
    }

    // Construiește răspunsul dinamic cu date reale
    const dynamicReply = await buildDynamicReply(dynamicIntent, session.$id, context);
    
    // Combină răspunsul de bază cu cel dinamic
    const finalReply = dynamicReply || baseReply;

    return NextResponse.json({ reply: finalReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "A apărut o eroare. Încearcă din nou." },
      { status: 200 }
    );
  }
}
