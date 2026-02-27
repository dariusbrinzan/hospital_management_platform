import { NextRequest, NextResponse } from "next/server";
import { getReply, type ChatContext } from "@/lib/chatbot-rules";
import {
  getCurrentSession,
  getDoctorSession,
  getAdminSession,
} from "@/lib/actions/auth.actions";
import { getPatient } from "@/lib/actions/patient.actions";
import {
  getPatientAppointments,
  getRecentAppointmentList,
} from "@/lib/actions/appointment.actions";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/actions/notification.actions";
import {
  medicalRecordHelpers,
  prescriptionHelpers,
  labResultHelpers,
  allergyHelpers,
  vaccinationHelpers,
  vitalSignsHelpers,
  appointmentHelpers,
  patientHelpers,
  doctorNotificationHelpers,
  appointmentMessageHelpers,
  emergencyHelpers,
  icuHelpers,
  hospitalAdmissionHelpers,
  medicationStockHelpers,
  equipmentHelpers,
  ambulanceHelpers,
  ambulanceMissionHelpers,
  doctorsOnDutyHelpers,
  problemReportsHelpers,
  imagingStudyHelpers,
  consumableRequestsHelpers,
  internalTransportHelpers,
} from "@/lib/db-helpers";
import { formatDateTime, formatDoctorDisplayName } from "@/lib/utils";
import { Doctors } from "@/constants";

// ─── PATIENT dynamic replies ───────────────────────────────
async function buildPatientDynamicReply(
  dynamicIntent: string,
  userId: string,
  context?: ChatContext
): Promise<string> {
  const patient = await getPatient(userId);
  if (!patient) {
    return "Nu am găsit profilul tău de pacient. Te rog să te autentifici.";
  }
  const patientId = (patient as any).$id || (patient as any).id;

  switch (dynamicIntent) {
    case "upcoming_appointments": {
      const appointments = await getPatientAppointments(userId);
      const upcoming = (appointments?.upcoming || [])
        .filter((apt: any) => apt.status !== "cancelled")
        .sort(
          (a: any, b: any) =>
            new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
        )
        .slice(0, 5);

      if (upcoming.length === 0)
        return "Nu ai programări viitoare. Poți face una nouă din Dashboard.";

      let reply = `Ai ${upcoming.length} programări viitoare:\n\n`;
      upcoming.forEach((apt: any, idx: number) => {
        reply += `${idx + 1}. ${formatDateTime(apt.schedule).dateTime} - ${formatDoctorDisplayName(apt.primaryPhysician)}`;
        if (apt.reason) reply += ` (${apt.reason})`;
        reply += `\n`;
      });
      reply += `\nPentru detalii, mergi în Dashboard.`;
      return reply;
    }

    case "past_appointments": {
      const appointments = await getPatientAppointments(userId);
      const past = (appointments?.past || [])
        .filter((apt: any) => apt.status !== "cancelled")
        .sort(
          (a: any, b: any) =>
            new Date(b.schedule).getTime() - new Date(a.schedule).getTime()
        )
        .slice(0, 5);

      if (past.length === 0) return "Nu ai programări trecute.";

      let reply = `Programări trecute (ultimele ${past.length}):\n\n`;
      past.forEach((apt: any, idx: number) => {
        reply += `${idx + 1}. ${formatDateTime(apt.schedule).dateTime} - ${formatDoctorDisplayName(apt.primaryPhysician)}`;
        if (apt.reason) reply += ` (${apt.reason})`;
        reply += `\n`;
      });
      return reply;
    }

    case "recent_medical_history": {
      const records = medicalRecordHelpers
        .getByPatientId(patientId)
        .slice(0, 5);
      if (records.length === 0)
        return "Nu ai consultații înregistrate încă.";

      let reply = `Ultimele ${records.length} consultații:\n\n`;
      records.forEach((record: any, idx: number) => {
        reply += `${idx + 1}. ${formatDateTime(record.visitDate).dateOnly} - ${formatDoctorDisplayName(record.doctorName)}`;
        if (record.chiefComplaint) reply += `\n   Motiv: ${record.chiefComplaint}`;
        if (record.assessment) reply += `\n   Diagnostic: ${record.assessment}`;
        reply += `\n`;
      });
      return reply;
    }

    case "active_medications": {
      const prescriptions =
        prescriptionHelpers.getActiveByPatientId(patientId);
      if (prescriptions.length === 0)
        return "Nu ai medicamente active în acest moment.";

      let reply = `Medicamente active (${prescriptions.length}):\n\n`;
      prescriptions.forEach((rx: any, idx: number) => {
        reply += `${idx + 1}. ${rx.medicationName}`;
        if (rx.dosage) reply += ` - ${rx.dosage}`;
        if (rx.frequency) reply += `, ${rx.frequency}`;
        reply += `\n`;
      });
      return reply;
    }

    case "recent_lab_results": {
      const results = labResultHelpers
        .getByPatientId(patientId)
        .slice(0, 5);
      if (results.length === 0)
        return "Nu ai rezultate de analize încă.";

      let reply = `Analize recente (${results.length}):\n\n`;
      results.forEach((r: any, idx: number) => {
        reply += `${idx + 1}. ${r.testName} (${formatDateTime(r.performedDate).dateOnly})`;
        if (r.resultValue) reply += `: ${r.resultValue}`;
        if (r.unit) reply += ` ${r.unit}`;
        if (r.status) reply += ` - ${r.status}`;
        reply += `\n`;
      });
      return reply;
    }

    case "unread_notifications": {
      const count = await getUnreadNotificationCount(userId);
      if (count === 0) return "Nu ai notificări necitite.";

      const notifications = await getUserNotifications(userId, 5);
      const unread = notifications.filter((n: any) => !n.isRead).slice(0, 5);

      let reply = `Ai ${count} notificări necitite:\n\n`;
      unread.forEach((n: any, idx: number) => {
        reply += `${idx + 1}. ${n.title}`;
        if (n.message) reply += `\n   ${n.message}`;
        reply += `\n`;
      });
      return reply;
    }

    case "allergies": {
      const allergies = allergyHelpers.getByPatientId(patientId);
      if (allergies.length === 0) return "Nu ai alergii înregistrate.";

      let reply = `Alergii (${allergies.length}):\n\n`;
      allergies.forEach((a: any, idx: number) => {
        reply += `${idx + 1}. ${a.allergenType}`;
        if (a.allergenName) reply += `: ${a.allergenName}`;
        if (a.severity) reply += ` (${a.severity})`;
        reply += `\n`;
      });
      return reply;
    }

    case "recent_vaccinations": {
      const vaccinations = vaccinationHelpers
        .getByPatientId(patientId)
        .slice(0, 5);
      if (vaccinations.length === 0) return "Nu ai vaccinări înregistrate.";

      let reply = `Vaccinări recente (${vaccinations.length}):\n\n`;
      vaccinations.forEach((v: any, idx: number) => {
        reply += `${idx + 1}. ${v.vaccineName} - ${formatDateTime(v.administrationDate).dateOnly}`;
        reply += `\n`;
      });
      return reply;
    }

    case "vital_signs": {
      const vitals = vitalSignsHelpers
        .getByPatientId(patientId)
        .slice(0, 3);
      if (vitals.length === 0) return "Nu ai semne vitale înregistrate.";

      let reply = `Semne vitale recente:\n\n`;
      vitals.forEach((v: any, idx: number) => {
        reply += `${idx + 1}. ${formatDateTime(v.recordedAt).dateTime}:\n`;
        if (v.bloodPressure) reply += `   Tensiune: ${v.bloodPressure}\n`;
        if (v.heartRate) reply += `   Puls: ${v.heartRate} bpm\n`;
        if (v.temperature) reply += `   Temperatură: ${v.temperature}°C\n`;
        if (v.weight) reply += `   Greutate: ${v.weight} kg\n`;
      });
      return reply;
    }

    case "patient_info": {
      const p = patient as any;
      let reply = "Datele tale personale:\n\n";
      if (p.name) reply += `Nume: ${p.name}\n`;
      if (p.email) reply += `Email: ${p.email}\n`;
      if (p.phone) reply += `Telefon: ${p.phone}\n`;
      if (p.address) reply += `Adresă: ${p.address}\n`;
      if (p.birthDate)
        reply += `Data nașterii: ${formatDateTime(p.birthDate).dateOnly}\n`;
      if (p.gender) reply += `Gen: ${p.gender}\n`;
      if (p.bloodType) reply += `Grup sanguin: ${p.bloodType}\n`;
      reply += `\nActualizezi din Profil Medical.`;
      return reply;
    }

    case "insurance_info": {
      const p = patient as any;
      if (!p.insuranceProvider && !p.insurancePolicyNumber)
        return "Nu ai informații de asigurare.";
      let reply = "Asigurare medicală:\n\n";
      if (p.insuranceProvider) reply += `Asigurator: ${p.insuranceProvider}\n`;
      if (p.insurancePolicyNumber)
        reply += `Poliță: ${p.insurancePolicyNumber}\n`;
      return reply;
    }

    case "emergency_contact": {
      const p = patient as any;
      if (!p.emergencyContactName && !p.emergencyContactNumber)
        return "Nu ai contact de urgență.";
      let reply = "Contact de urgență:\n\n";
      if (p.emergencyContactName) reply += `Nume: ${p.emergencyContactName}\n`;
      if (p.emergencyContactNumber)
        reply += `Telefon: ${p.emergencyContactNumber}\n`;
      return reply;
    }

    case "family_history": {
      const p = patient as any;
      if (!p.familyMedicalHistory)
        return "Nu ai istoric familial înregistrat.";
      return `Istoric medical familial:\n\n${p.familyMedicalHistory}`;
    }

    default:
      return "";
  }
}

// ─── DOCTOR dynamic replies ────────────────────────────────
function buildDoctorDynamicReply(
  dynamicIntent: string,
  doctorName: string
): string {
  const allAppointments =
    appointmentHelpers
      .getAll()
      .filter((a: any) => a.primaryPhysician === doctorName) ?? [];

  const now = new Date();

  switch (dynamicIntent) {
    case "doctor_appointments": {
      const upcoming = allAppointments
        .filter(
          (a: any) =>
            a.status !== "cancelled" && new Date(a.schedule) >= now
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.schedule).getTime() - new Date(b.schedule).getTime()
        )
        .slice(0, 5);

      const scheduled = allAppointments.filter(
        (a: any) => a.status === "scheduled"
      ).length;
      const pending = allAppointments.filter(
        (a: any) => a.status === "pending"
      ).length;
      const cancelled = allAppointments.filter(
        (a: any) => a.status === "cancelled"
      ).length;

      let reply = `Statistici programări: ${scheduled} confirmate, ${pending} în așteptare, ${cancelled} anulate.\n`;

      if (upcoming.length === 0) {
        reply += "\nNu ai programări viitoare.";
        return reply;
      }

      reply += `\nUrmătoarele ${upcoming.length} programări:\n\n`;
      upcoming.forEach((apt: any, idx: number) => {
        const patientName = apt.patient?.name || "Necunoscut";
        reply += `${idx + 1}. ${formatDateTime(apt.schedule).dateTime} - ${patientName}`;
        if (apt.reason) reply += ` (${apt.reason})`;
        reply += ` [${apt.status}]\n`;
      });
      return reply;
    }

    case "doctor_patients": {
      const patientsMap = new Map<string, { name: string; count: number; lastVisit: string }>();
      for (const apt of allAppointments) {
        const pid = apt.patient?.$id;
        if (!pid) continue;
        const schedStr = String(apt.schedule);
        const existing = patientsMap.get(pid);
        if (existing) {
          existing.count++;
          if (new Date(schedStr) > new Date(existing.lastVisit))
            existing.lastVisit = schedStr;
        } else {
          patientsMap.set(pid, {
            name: apt.patient?.name ?? "Necunoscut",
            count: 1,
            lastVisit: schedStr,
          });
        }
      }

      const patients = Array.from(patientsMap.values())
        .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
        .slice(0, 10);

      if (patients.length === 0) return "Nu ai niciun pacient în istoric.";

      let reply = `Ai ${patientsMap.size} pacienți unici. Ultimii ${patients.length}:\n\n`;
      patients.forEach((p, idx) => {
        reply += `${idx + 1}. ${p.name} - ${p.count} programări, ultima: ${formatDateTime(p.lastVisit).dateOnly}\n`;
      });
      reply += `\nVezi toți pacienții în Istoric pacienți.`;
      return reply;
    }

    case "doctor_messages": {
      const doctorApts = allAppointments.filter(
        (a: any) => a.status !== "cancelled"
      );
      let totalMessages = 0;
      let patientMessages = 0;
      for (const apt of doctorApts.slice(0, 50)) {
        const msgs = appointmentMessageHelpers.getByAppointmentId(apt.$id);
        totalMessages += msgs.length;
        patientMessages += msgs.filter((m: any) => m.senderRole === "patient").length;
      }

      if (totalMessages === 0) return "Nu ai mesaje de la pacienți.";

      return `Ai ${totalMessages} mesaje totale, din care ${patientMessages} de la pacienți. Verifică-le din Mesaje.`;
    }

    case "doctor_profile": {
      const doctor = Doctors.find((d) => d.name === doctorName);
      if (!doctor) return "Nu am găsit profilul tău.";

      let reply = "Profilul tău:\n\n";
      reply += `Nume: ${doctor.name}\n`;
      reply += `Specializare: ${doctor.specialty}\n`;
      if (doctor.age) reply += `Vârstă: ${doctor.age} ani\n`;
      if (doctor.experience) reply += `Experiență: ${doctor.experience}\n`;
      if (doctor.education) reply += `Educație: ${doctor.education}\n`;
      if (doctor.languages?.length)
        reply += `Limbi: ${doctor.languages.join(", ")}\n`;
      return reply;
    }

    case "doctor_stats": {
      const scheduled = allAppointments.filter(
        (a: any) => a.status === "scheduled"
      ).length;
      const pending = allAppointments.filter(
        (a: any) => a.status === "pending"
      ).length;
      const cancelled = allAppointments.filter(
        (a: any) => a.status === "cancelled"
      ).length;
      const total = allAppointments.length;

      const pids = new Set(
        allAppointments
          .filter((a: any) => a.patient?.$id)
          .map((a: any) => a.patient.$id)
      );

      const unreadNotifs = doctorNotificationHelpers.getUnreadCount(doctorName);

      return (
        `Statistici rapide:\n\n` +
        `Total programări: ${total}\n` +
        `Confirmate: ${scheduled}\n` +
        `În așteptare: ${pending}\n` +
        `Anulate: ${cancelled}\n` +
        `Pacienți unici: ${pids.size}\n` +
        `Notificări necitite: ${unreadNotifs}`
      );
    }

    case "doctor_notifications": {
      const unread = doctorNotificationHelpers.getUnreadCount(doctorName);
      if (unread === 0) return "Nu ai notificări necitite.";

      const notifs = doctorNotificationHelpers.getByDoctorName(doctorName, 5);
      const unreadNotifs = notifs.filter((n: any) => !n.isRead).slice(0, 5);

      let reply = `Ai ${unread} notificări necitite:\n\n`;
      unreadNotifs.forEach((n: any, idx: number) => {
        reply += `${idx + 1}. ${n.title}`;
        if (n.message) reply += ` - ${n.message}`;
        reply += `\n`;
      });
      return reply;
    }

    default:
      return "";
  }
}

// ─── ADMIN dynamic replies ─────────────────────────────────
function buildAdminDynamicReply(dynamicIntent: string): string {
  switch (dynamicIntent) {
    case "admin_appointments": {
      const all = appointmentHelpers.getAll();
      const scheduled = all.filter((a: any) => a.status === "scheduled").length;
      const pending = all.filter((a: any) => a.status === "pending").length;
      const cancelled = all.filter((a: any) => a.status === "cancelled").length;

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const today = all.filter(
        (a: any) =>
          a.schedule &&
          new Date(a.schedule).toISOString().slice(0, 10) === todayStr &&
          a.status !== "cancelled"
      );

      return (
        `Programări (total ${all.length}):\n\n` +
        `Confirmate: ${scheduled}\n` +
        `În așteptare: ${pending}\n` +
        `Anulate: ${cancelled}\n` +
        `Azi: ${today.length} programări active\n` +
        `\nVezi toate detaliile pe Dashboard.`
      );
    }

    case "admin_patients": {
      const patients = patientHelpers.getAll();
      return `Sunt ${patients.length} pacienți înregistrați în sistem. Verifică lista din secțiunea Pacienți.`;
    }

    case "admin_emergencies": {
      const cases = emergencyHelpers.getAll();
      const active = cases.filter(
        (c: any) =>
          c.currentState !== "discharged" && c.currentState !== "deceased"
      );
      const critic = active.filter(
        (c: any) => c.triageLevel === "critic"
      ).length;
      const urgent = active.filter(
        (c: any) => c.triageLevel === "urgent"
      ).length;
      const normal = active.filter(
        (c: any) => c.triageLevel === "normal"
      ).length;

      if (active.length === 0)
        return "Nu sunt cazuri de urgență active momentan.";

      return (
        `Urgențe active: ${active.length}\n\n` +
        `Critice: ${critic}\n` +
        `Urgente: ${urgent}\n` +
        `Normale: ${normal}\n` +
        `\nDetalii în secțiunea Urgențe.`
      );
    }

    case "admin_icu": {
      const rooms = icuHelpers.getAllRooms();
      const totalBeds = rooms.reduce((s: number, r: any) => s + r.maxCapacity, 0);
      const occupied = rooms.reduce(
        (s: number, r: any) => s + r.currentOccupancy,
        0
      );
      const available = totalBeds - occupied;

      const patients = icuHelpers.getAllPatients();
      const activePatients = patients.filter(
        (p: any) => p.status === "critical" || p.status === "stable"
      ).length;

      return (
        `ATI - Terapie Intensivă:\n\n` +
        `Paturi: ${totalBeds} total, ${occupied} ocupate, ${available} libere\n` +
        `Pacienți activi: ${activePatients}\n` +
        `Săli: ${rooms.length}\n` +
        `\nDetalii în secțiunea ATI.`
      );
    }

    case "admin_admissions": {
      const admissions = hospitalAdmissionHelpers.getAllAdmissions();

      if (admissions.length === 0)
        return "Nu sunt internări active momentan.";

      return (
        `Internări active: ${admissions.length}\n\n` +
        `Verifică detalii (departamente, diagnoze, doctori) în secțiunea Internări.`
      );
    }

    case "admin_medications": {
      const stocks = medicationStockHelpers.getAll();
      const lowStock = stocks.filter(
        (s: any) => s.currentQuantity <= s.minimumQuantity
      );

      let reply = `Medicamente în stoc: ${stocks.length} intrări.\n`;
      if (lowStock.length > 0) {
        reply += `\nALERTĂ: ${lowStock.length} medicamente cu stoc scăzut:\n\n`;
        lowStock.slice(0, 5).forEach((s: any, idx: number) => {
          reply += `${idx + 1}. ${s.medicationName || s.name || "N/A"} - ${s.currentQuantity}/${s.minimumQuantity} (minim)\n`;
        });
      } else {
        reply += "Toate stocurile sunt la un nivel adecvat.";
      }
      return reply;
    }

    case "admin_equipment": {
      const equipment = equipmentHelpers.getAll();
      const maintenance = equipment.filter(
        (e: any) => e.status === "maintenance"
      ).length;
      const operational = equipment.filter(
        (e: any) => e.status === "operational"
      ).length;
      const outOfService = equipment.filter(
        (e: any) => e.status === "out_of_service"
      ).length;

      return (
        `Echipamente (${equipment.length} total):\n\n` +
        `Operaționale: ${operational}\n` +
        `În mentenanță: ${maintenance}\n` +
        `Scoase din funcțiune: ${outOfService}\n` +
        `\nDetalii în Echipamente.`
      );
    }

    case "admin_transport": {
      const ambulances = ambulanceHelpers.getAll();
      const available = ambulances.filter(
        (a: any) => a.status === "available"
      ).length;
      const onMission = ambulances.filter(
        (a: any) => a.status === "on_mission"
      ).length;

      const activeMissions = ambulanceMissionHelpers.getActive();

      return (
        `Ambulanțe (${ambulances.length} total):\n\n` +
        `Disponibile: ${available}\n` +
        `În misiune: ${onMission}\n` +
        `Misiuni active: ${activeMissions.length}\n` +
        `\nDetalii în Ambulanțe.`
      );
    }

    case "admin_on_duty": {
      try {
        const workloads = doctorsOnDutyHelpers.getAllWorkloads();
        const onDuty = workloads.filter((w: any) => w.isOnDuty);

        if (onDuty.length === 0) return "Nu sunt medici de gardă în acest moment.";

        let reply = `Medici de gardă: ${onDuty.length}\n\n`;
        onDuty.slice(0, 5).forEach((w: any, idx: number) => {
          reply += `${idx + 1}. ${w.doctorName} (${w.specialty || "N/A"})\n`;
        });
        return reply;
      } catch {
        return "Informații gardă indisponibile momentan.";
      }
    }

    case "admin_reports": {
      const reports = problemReportsHelpers.getAll();
      const newReports = reports.filter((r: any) => r.status === "new");
      const inProgress = reports.filter(
        (r: any) => r.status === "in_progress"
      );

      return (
        `Rapoarte probleme (${reports.length} total):\n\n` +
        `Noi: ${newReports.length}\n` +
        `În lucru: ${inProgress.length}\n` +
        `Rezolvate: ${reports.length - newReports.length - inProgress.length}\n` +
        `\nDetalii în Rapoarte probleme.`
      );
    }

    case "admin_imaging": {
      try {
        const studies = imagingStudyHelpers.getAllUpcoming(20);
        return `Investigații imagistice programate: ${studies.length}. Verifică detaliile din Imagistică.`;
      } catch {
        return "Secțiunea Imagistică nu are date momentan.";
      }
    }

    case "admin_reports_dashboard": {
      return (
        "Rapoarte (Dashboard):\n\n" +
        "• Grafice: programări pe zile, ocupare medici, urgențe și imagistică pe zile.\n" +
        "• Contribuție gărzi: nr. gărzi per medic, 350 lei/gardă, total de plată.\n" +
        "• Export CSV: toate datele în format tabelar.\n" +
        "• Export PDF: raport complet (programări, medici, urgențe, imagistică, gărzi).\n" +
        "Perioadă: 7, 30 sau 90 zile. Secțiunea Rapoarte din meniu."
      );
    }

    case "admin_lab_import": {
      return (
        "Import analize:\n\n" +
        "În secțiunea Import analize poți încărca fișiere CSV/Excel cu rezultate de laborator. " +
        "Verifici asistența pacientului și maparea coloanelor (parametru, valoare, unitate, data) înainte de import."
      );
    }

    case "admin_logistics": {
      const consumablePending = consumableRequestsHelpers.getAll(undefined, "pending");
      const transportPending = internalTransportHelpers.getAll("pending");

      let reply =
        "Logistică:\n\n" +
        `Cereri consumabile în așteptare: ${consumablePending.length}\n` +
        `Cereri transport intern în așteptare: ${transportPending.length}\n\n`;

      if (consumablePending.length > 0) {
        reply += "Consumabile recente (primele 3):\n";
        consumablePending.slice(0, 3).forEach((r: any, idx: number) => {
          reply += `${idx + 1}. ${r.department} - ${r.requestedBy} (${r.priority})\n`;
        });
      }
      if (transportPending.length > 0) {
        reply += "\nTransport intern recent (primele 3):\n";
        transportPending.slice(0, 3).forEach((r: any, idx: number) => {
          reply += `${idx + 1}. ${r.patientName}: ${r.fromLocation} → ${r.toLocation} (${r.transportType})\n`;
        });
      }
      reply += "\nAprobare/onorare din secțiunea Logistică.";
      return reply;
    }

    case "admin_stats": {
      const allApt = appointmentHelpers.getAll();
      const patients = patientHelpers.getAll();
      const emergencies = emergencyHelpers.getAll();
      const activeEmergencies = emergencies.filter(
        (c: any) =>
          c.currentState !== "discharged" && c.currentState !== "deceased"
      );
      const admissions = hospitalAdmissionHelpers.getAllAdmissions();
      const icuRooms = icuHelpers.getAllRooms();
      const totalBeds = icuRooms.reduce(
        (s: number, r: any) => s + r.maxCapacity,
        0
      );
      const occupiedBeds = icuRooms.reduce(
        (s: number, r: any) => s + r.currentOccupancy,
        0
      );
      const reports = problemReportsHelpers.getAll();
      const newReports = reports.filter((r: any) => r.status === "new").length;

      return (
        `Rezumat general:\n\n` +
        `Programări: ${allApt.length}\n` +
        `Pacienți: ${patients.length}\n` +
        `Urgențe active: ${activeEmergencies.length}\n` +
        `Internări active: ${admissions.length}\n` +
        `Paturi ATI: ${occupiedBeds}/${totalBeds} ocupate\n` +
        `Rapoarte noi: ${newReports}\n` +
        `\nDashboard-ul arată toate detaliile.`
      );
    }

    default:
      return "";
  }
}

/** Delay „se gândește” 3–4 secunde. */
const CHAT_THINKING_DELAY_MS = 3500;

// ─── POST handler ──────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const context: ChatContext | undefined = body.context;

    if (!message) {
      return NextResponse.json({ reply: "Scrie ceva și îți răspund." });
    }

    await new Promise((r) => setTimeout(r, CHAT_THINKING_DELAY_MS));

    const { reply: baseReply, dynamicIntent } = getReply(message, context);

    if (!dynamicIntent) {
      return NextResponse.json({ reply: baseReply });
    }

    const role = context?.role;

    // Admin
    if (role === "admin") {
      const adminSession = await getAdminSession();
      if (!adminSession) {
        return NextResponse.json({
          reply: baseReply + "\n\nTe rog să te autentifici ca administrator.",
        });
      }
      if (dynamicIntent === "admin_guard_payments") {
        const { getGuardPaymentsByDoctor } = await import("@/lib/actions/reports.actions");
        const payments = await getGuardPaymentsByDoctor("30");
        if (payments.length === 0) {
          return NextResponse.json({
            reply: "În ultimele 30 zile nu există gărzi înregistrate. Gărzi se plătesc 350 lei/gardă. Raportul complet este în Rapoarte → Contribuție gărzi.",
          });
        }
        const total = payments.reduce((s, p) => s + p.amountLei, 0);
        let reply = "Contribuție gărzi (ultimele 30 zile, 350 lei/gardă):\n\n";
        payments.forEach((p, idx) => {
          reply += `${idx + 1}. ${p.doctorName}: ${p.guardsCount} gărzi = ${p.amountLei.toLocaleString("ro-RO")} lei\n`;
        });
        reply += `\nTotal de plată: ${total.toLocaleString("ro-RO")} lei.\n\nDetalii și export PDF/CSV în Rapoarte.`;
        return NextResponse.json({ reply });
      }
      const dynamicReply = buildAdminDynamicReply(dynamicIntent);
      return NextResponse.json({ reply: dynamicReply || baseReply });
    }

    // Doctor
    if (role === "doctor") {
      const doctorName = await getDoctorSession();
      if (!doctorName) {
        return NextResponse.json({
          reply: baseReply + "\n\nTe rog să te autentifici ca medic.",
        });
      }
      const dynamicReply = buildDoctorDynamicReply(dynamicIntent, doctorName);
      return NextResponse.json({ reply: dynamicReply || baseReply });
    }

    // Patient (default)
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({
        reply:
          baseReply + "\n\nPentru a vedea datele tale, te rog să te autentifici.",
      });
    }
    const dynamicReply = await buildPatientDynamicReply(
      dynamicIntent,
      session.$id,
      context
    );
    return NextResponse.json({ reply: dynamicReply || baseReply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "A apărut o eroare. Încearcă din nou." },
      { status: 200 }
    );
  }
}
