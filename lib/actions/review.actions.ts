"use server";

import { getCurrentSession } from "./auth.actions";
import { doctorReviewHelpers, appointmentHelpers, patientHelpers } from "../db-helpers";
import { parseStringify } from "../utils";

export const submitReview = async (
  appointmentId: string,
  rating: number,
  comment: string
) => {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { error: "Nu ești autentificat" };
    }

    if (rating < 1 || rating > 5) {
      return { error: "Rating-ul trebuie să fie între 1 și 5" };
    }

    const appointment = appointmentHelpers.getById(appointmentId);
    if (!appointment) {
      return { error: "Programarea nu a fost găsită" };
    }

    if (appointment.userId !== session.$id) {
      return { error: "Nu ai permisiunea să evaluezi această programare" };
    }

    const existing = doctorReviewHelpers.getByAppointmentId(appointmentId);
    if (existing) {
      return { error: "Ai evaluat deja această programare" };
    }

    const patient = patientHelpers.getByUserId(session.$id);
    if (!patient) {
      return { error: "Profilul de pacient nu a fost găsit" };
    }

    const review = doctorReviewHelpers.create({
      appointmentId,
      patientId: patient.$id,
      doctorName: appointment.primaryPhysician,
      rating,
      comment: comment.trim() || undefined,
    });

    return parseStringify({ success: true, review });
  } catch (error) {
    console.error("Error submitting review:", error);
    return { error: "A apărut o eroare la trimiterea evaluării" };
  }
};

export const getReviewForAppointment = async (appointmentId: string) => {
  try {
    const review = doctorReviewHelpers.getByAppointmentId(appointmentId);
    return parseStringify(review);
  } catch (error) {
    console.error("Error getting review:", error);
    return null;
  }
};

export const getDoctorAverageRating = async (doctorName: string) => {
  try {
    return doctorReviewHelpers.getAverageRating(doctorName);
  } catch (error) {
    console.error("Error getting average rating:", error);
    return { average: 0, count: 0 };
  }
};

export const getAllDoctorRatings = async () => {
  try {
    return doctorReviewHelpers.getAllAverageRatings();
  } catch (error) {
    console.error("Error getting all ratings:", error);
    return {};
  }
};
