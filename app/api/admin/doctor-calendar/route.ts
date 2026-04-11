import { NextRequest, NextResponse } from "next/server";

import { doctorScheduleEventHelpers, doctorsOnDutyHelpers } from "@/lib/db-helpers";

const BLOCKING_EVENT_TYPES = new Set(["vacation", "medical_leave", "time_off"]);

export async function GET() {
  try {
    const scheduleEvents = doctorScheduleEventHelpers.getAll().map((event) => ({
      ...event,
      source: "schedule_event" as const,
      readOnly: false,
      title: event.doctorName,
    }));

    const dutyEvents = doctorsOnDutyHelpers.getAll().map((duty) => ({
      $id: `duty-${duty.$id}`,
      doctorName: duty.doctorName,
      eventType: "guard",
      startDate: duty.weekStartDate,
      endDate: duty.weekEndDate,
      notes: `Gardă activă${duty.specialty ? ` · ${duty.specialty}` : ""}`,
      affectsAppointments: false,
      affectsDuty: false,
      createdAt: duty.createdAt,
      updatedAt: duty.updatedAt,
      source: "duty" as const,
      readOnly: true,
      title: duty.doctorName,
    }));

    return NextResponse.json([...scheduleEvents, ...dutyEvents]);
  } catch (error: any) {
    console.error("Error fetching doctor calendar events:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la încărcarea calendarului medicilor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorName, eventType, startDate, endDate, notes } = body ?? {};

    if (!doctorName || !eventType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "doctorName, eventType, startDate și endDate sunt obligatorii." },
        { status: 400 }
      );
    }

    const affectsBlockingFlows = BLOCKING_EVENT_TYPES.has(eventType);
    const created = doctorScheduleEventHelpers.create({
      doctorName,
      eventType,
      startDate,
      endDate,
      notes: notes || null,
      affectsAppointments: affectsBlockingFlows,
      affectsDuty: affectsBlockingFlows,
    });

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Error creating doctor calendar event:", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la salvarea evenimentului pentru medic." },
      { status: 500 }
    );
  }
}
