"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SelectItem, Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Doctors, MedicalSpecialties } from "@/constants";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment } from "@/types/appwrite.types";

import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { SlotSelector } from "../SlotSelector";
import { isValidAppointmentDate } from "@/lib/utils";

export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    appointment ? new Date(appointment.schedule) : null
  );
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(
    appointment ? new Date(appointment.schedule) : null
  );

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment?.primaryPhysician : "",
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const watchedDoctor = form.watch("primaryPhysician");
  const watchedSchedule = form.watch("schedule");

  // Filtrează doctorii după specializarea selectată
  const filteredDoctors = selectedSpecialty
    ? Doctors.filter((doctor) => doctor.specialty === selectedSpecialty)
    : [];

  // Când se schimbă doctorul, actualizează specializarea
  useEffect(() => {
    if (watchedDoctor && type === "create") {
      const doctor = Doctors.find((d) => d.name === watchedDoctor);
      if (doctor && doctor.specialty !== selectedSpecialty) {
        setSelectedSpecialty(doctor.specialty);
      }
    }
  }, [watchedDoctor, type]);

  // Actualizează selectedDate când se schimbă data din formular
  useEffect(() => {
    if (watchedSchedule && type === "create") {
      const scheduleDate = new Date(watchedSchedule);
      // Verifică dacă data s-a schimbat (fără să țină cont de timp)
      const scheduleDateOnly = new Date(scheduleDate);
      scheduleDateOnly.setHours(0, 0, 0, 0);
      
      const currentDateOnly = selectedDate ? new Date(selectedDate) : null;
      currentDateOnly?.setHours(0, 0, 0, 0);
      
      if (!currentDateOnly || scheduleDateOnly.getTime() !== currentDateOnly.getTime()) {
        setSelectedDate(scheduleDateOnly);
        setSelectedSlot(null);
      }
    }
  }, [watchedSchedule, type, selectedDate]);

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    setIsLoading(true);

    // Pentru programări noi, folosim slot-ul selectat
    const scheduleDate = type === "create" && selectedSlot 
      ? selectedSlot 
      : new Date(values.schedule);

    // Verifică dacă slot-ul este valid pentru programări noi
    if (type === "create" && !selectedSlot) {
      alert("Vă rugăm să selectați un slot disponibil");
      setIsLoading(false);
      return;
    }

    if (type === "create" && !isValidAppointmentDate(scheduleDate)) {
      alert("Data selectată nu este validă. Selectați o zi lucrătoare în viitor.");
      setIsLoading(false);
      return;
    }

    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        // Programările noi sunt automat confirmate (scheduled)
        status = "scheduled";
    }

    try {
      if (type === "create" && patientId) {
        const appointment = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: scheduleDate,
          reason: values.reason!,
          status: status as Status,
          note: values.note,
        };

        const newAppointment = await createAppointment(appointment);

        if (newAppointment) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`
          );
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: scheduleDate,
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
      alert("A apărut o eroare. Slot-ul poate fi deja rezervat. Vă rugăm să încercați din nou.");
    }
    setIsLoading(false);
  };

  let buttonLabel;
  switch (type) {
    case "cancel":
      buttonLabel = "Anulează programarea";
      break;
    case "schedule":
      buttonLabel = "Confirmă programarea";
      break;
    default:
      buttonLabel = "Trimite cererea";
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">Programare nouă</h1>
            <p className="text-dark-600">
              Solicită o programare nouă în 10 secunde.
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            {type === "create" ? (
              <>
                <FormField
                  control={form.control}
                  name="primaryPhysician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specializare</FormLabel>
                      <FormControl>
                        <Select
                          value={selectedSpecialty}
                          onValueChange={(value) => {
                            setSelectedSpecialty(value);
                            form.setValue("primaryPhysician", ""); // Resetează doctorul când se schimbă specializarea
                            setSelectedDate(null);
                            setSelectedSlot(null);
                          }}
                        >
                          <SelectTrigger className="shad-select-trigger">
                            <SelectValue placeholder="Selectează o specializare" />
                          </SelectTrigger>
                          <SelectContent className="shad-select-content">
                            {MedicalSpecialties.map((specialty, i) => (
                              <SelectItem key={specialty + i} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedSpecialty && filteredDoctors.length > 0 && (
                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={form.control}
                    name="primaryPhysician"
                    label="Doctor"
                    placeholder="Selectează un doctor"
                  >
                    {filteredDoctors.map((doctor, i) => (
                      <SelectItem key={doctor.name + i} value={doctor.name}>
                        <div className="flex cursor-pointer items-center gap-2">
                          <Image
                            src={doctor.image}
                            width={32}
                            height={32}
                            alt="doctor"
                            className="rounded-full border border-dark-300"
                          />
                          <p>{doctor.name}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </CustomFormField>
                )}
                {selectedSpecialty && filteredDoctors.length === 0 && (
                  <p className="text-14-regular text-dark-500">
                    Nu există doctori disponibili pentru această specializare.
                  </p>
                )}
              </>
            ) : (
              <CustomFormField
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="primaryPhysician"
                label="Doctor"
                placeholder="Selectează un doctor"
              >
                {Doctors.map((doctor, i) => (
                  <SelectItem key={doctor.name + i} value={doctor.name}>
                    <div className="flex cursor-pointer items-center gap-2">
                      <Image
                        src={doctor.image}
                        width={32}
                        height={32}
                        alt="doctor"
                        className="rounded-full border border-dark-300"
                      />
                      <p>{doctor.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormField>
            )}

            {type === "create" ? (
              <>
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data programării</FormLabel>
                      <FormControl>
                        <div className="flex rounded-md border border-dark-200 bg-white">
                          <Image
                            src="/assets/icons/calendar.svg"
                            height={24}
                            width={24}
                            alt="calendar"
                            className="ml-2"
                          />
                          <ReactDatePicker
                            showTimeSelect={false}
                            selected={field.value ? new Date(field.value) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                const dateOnly = new Date(date);
                                dateOnly.setHours(0, 0, 0, 0);
                                field.onChange(dateOnly);
                                setSelectedDate(dateOnly);
                                setSelectedSlot(null);
                              }
                            }}
                            dateFormat="dd/MM/yyyy"
                            wrapperClassName="date-picker"
                            minDate={new Date()}
                            filterDate={(date) => {
                              const day = date.getDay();
                              return day !== 0 && day !== 6; // Exclude weekend
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedDoctor && selectedDate && (
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={() => (
                      <FormItem>
                        <FormLabel>Ora programării</FormLabel>
                        <FormControl>
                          <SlotSelector
                            doctorName={watchedDoctor}
                            selectedDate={selectedDate}
                            selectedSlot={selectedSlot}
                            onSlotSelect={(slot) => {
                              setSelectedSlot(slot);
                              form.setValue("schedule", slot);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            ) : (
              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="schedule"
                label="Data programării"
                showTimeSelect
                dateFormat="dd/MM/yyyy  -  HH:mm"
              />
            )}

            <div
              className={`flex flex-col gap-6  ${type === "create" && "xl:flex-row"}`}
            >
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Motivul programării"
                placeholder="Consult medical de rutină"
                disabled={type === "schedule"}
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Comentarii/note"
                placeholder="Prefer programări după-amiază, dacă este posibil"
                disabled={type === "schedule"}
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Motivul anulării"
            placeholder="A apărut o întâlnire urgentă"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};
