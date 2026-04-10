"use client";

import "react-datepicker/dist/react-datepicker.css";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SelectItem, Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Doctors, MedicalSpecialties, AnalysisPackages, AnalysisTestsCatalog } from "@/constants";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { isValidAppointmentDate } from "@/lib/utils";
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment } from "@/types/appwrite.types";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import { DoctorInfoCard } from "../DoctorInfoCard";
import { SlotSelector } from "../SlotSelector";
import SubmitButton from "../SubmitButton";
import { Checkbox } from "../ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
  patientGender,
  doctorRatings,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  patientGender?: "Bărbat" | "Femeie";
  doctorRatings?: Record<string, { average: number; count: number }>;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    appointment ? new Date(appointment.schedule) : null
  );
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(
    appointment ? new Date(appointment.schedule) : null
  );
  const [analysisMode, setAnalysisMode] = useState<"package" | "custom">("package");
  const [selectedCustomTests, setSelectedCustomTests] = useState<string[]>([]);

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
      analysisPackage: "",
      isInsured: false, // Default: nu este asigurat
      appointmentType: (appointment as any)?.appointmentType === "video" ? "video" : "in_person",
    },
  });

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedAnalysisPackage, setSelectedAnalysisPackage] = useState<string>("");
  const watchedDoctor = form.watch("primaryPhysician");
  const watchedSchedule = form.watch("schedule");
  const isInsured = form.watch("isInsured"); // Verifică dacă este asigurat

  // Filtrează doctorii după specializarea selectată
  const filteredDoctors = selectedSpecialty
    ? Doctors.filter((doctor) => doctor.specialty === selectedSpecialty)
    : [];

  // Filtrează pachetele de analize după specializare și gen
  const filteredAnalysisPackages = AnalysisPackages.filter((pkg) => {
    // Verifică dacă specializarea selectată este în lista de specializări ale pachetului
    const matchesSpecialty = pkg.specialties.includes(selectedSpecialty);
    
    // Verifică genul (dacă este specificat)
    const matchesGender = !pkg.gender || 
      pkg.gender === "Ambele" || 
      (patientGender && pkg.gender === patientGender);
    
    return matchesSpecialty && matchesGender;
  });

  const filteredCustomAnalysisTests = AnalysisTestsCatalog.filter((test) =>
    AnalysisPackages.some((pkg) => {
      const matchesSpecialty = pkg.specialties.includes(selectedSpecialty);
      const matchesGender =
        !pkg.gender ||
        pkg.gender === "Ambele" ||
        (patientGender && pkg.gender === patientGender);

      return matchesSpecialty && matchesGender && pkg.tests.includes(test.name);
    })
  );

  const customTestsTotalPrice = selectedCustomTests.reduce((sum, testName) => {
    const selectedTest = AnalysisTestsCatalog.find((test) => test.name === testName);
    return sum + (selectedTest?.price ?? 0);
  }, 0);

  const hasCustomAnalysisSelection =
    selectedSpecialty === "Analize medicale" &&
    analysisMode === "custom" &&
    selectedCustomTests.length > 0;
  const hasAnalysisSelection = Boolean(selectedAnalysisPackage) || hasCustomAnalysisSelection;

  // Când se schimbă doctorul, actualizează specializarea
  useEffect(() => {
    if (watchedDoctor && type === "create") {
      const doctor = Doctors.find((d) => d.name === watchedDoctor);
      if (doctor && doctor.specialty !== selectedSpecialty) {
        setSelectedSpecialty(doctor.specialty);
      }
    }
  }, [selectedSpecialty, watchedDoctor, type]);

  const toggleCustomTest = (testName: string, checked: boolean) => {
    setSelectedCustomTests((prev) =>
      checked ? [...prev, testName] : prev.filter((item) => item !== testName)
    );
  };

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

    if (selectedSpecialty === "Analize medicale" && analysisMode === "custom" && selectedCustomTests.length === 0) {
      toast.warning("Selectați cel puțin o analiză pentru a crea pachetul personalizat.");
      setIsLoading(false);
      return;
    }

    // Determină data programării
    let scheduleDate: Date;
    
    if (type === "create") {
      // Pentru pachete de analize, folosim data selectată direct
      if (hasAnalysisSelection && !selectedSlot) {
        const formDate = new Date(values.schedule);
        formDate.setHours(10, 0, 0, 0); // Setăm la ora 10:00 pentru analize
        scheduleDate = formDate;
      } else if (selectedSlot) {
        // Pentru programări normale, folosim slot-ul selectat
        scheduleDate = selectedSlot;
      } else {
        // Fallback la data din formular
        scheduleDate = new Date(values.schedule);
      }
      
      // Verifică dacă slot-ul este valid pentru programări noi (doar dacă nu este pachet de analize)
      if (!hasAnalysisSelection && !selectedSlot) {
        toast.warning("Vă rugăm să selectați un slot disponibil");
        setIsLoading(false);
        return;
      }
    } else {
      // Pentru update, folosim data din formular
      scheduleDate = new Date(values.schedule);
    }

    if (type === "create" && !isValidAppointmentDate(scheduleDate)) {
      toast.warning("Data selectată nu este validă. Selectați o zi lucrătoare în viitor.");
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
        // Dacă este selectat un pachet de analize, folosim doctorul selectat sau "Analize medicale" ca fallback
        const primaryPhysician = hasAnalysisSelection
          ? (values.primaryPhysician || "Analize medicale")
          : values.primaryPhysician || "";
        
        // Construiește nota cu informații despre pachetul de analize dacă este selectat
        let note = values.note || "";
        if (selectedAnalysisPackage) {
          const selectedPkg = AnalysisPackages.find(pkg => pkg.id === selectedAnalysisPackage);
          if (selectedPkg) {
            const priceInfo = isInsured 
              ? "Decontat de Casa de Asigurări de Sănătate" 
              : `${selectedPkg.price} RON`;
            note = `Pachet Analize: ${selectedPkg.name} (${priceInfo})\n${note ? note + '\n' : ''}Analize incluse: ${selectedPkg.tests.join(', ')}`;
          }
        } else if (hasCustomAnalysisSelection) {
          const priceInfo = isInsured
            ? "Decontat de Casa de Asigurări de Sănătate"
            : `${customTestsTotalPrice} RON`;
          note = `Pachet personalizat analize (${priceInfo})\n${note ? note + "\n" : ""}Analize selectate: ${selectedCustomTests.join(", ")}`;
        }

        const appointment = {
          userId,
          patient: patientId,
          primaryPhysician,
          schedule: scheduleDate,
          reason: values.reason || (hasAnalysisSelection ? "Analize medicale" : ""),
          status: status as Status,
          note,
          appointmentType: hasAnalysisSelection ? "in_person" : (values.appointmentType === "video" ? "video" : "in_person"),
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
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("A apărut o eroare. Slot-ul poate fi deja rezervat. Vă rugăm să încercați din nou.");
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
                            setAnalysisMode("package");
                            setSelectedAnalysisPackage("");
                            setSelectedCustomTests([]);
                            form.setValue("analysisPackage", "");
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
                {/* Afișează pachetele de analize dacă specializarea este "Analize medicale" */}
                {selectedSpecialty === "Analize medicale" && (
                  <>
                    {/* Checkbox pentru asigurare */}
                    <FormField
                      control={form.control}
                      name="isInsured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-dark-200 p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-14-medium text-dark-700 cursor-pointer">
                              Sunt asigurat cu Casa de Asigurări de Sănătate
                            </FormLabel>
                            <p className="text-12-regular text-dark-500">
                              Analizele vor fi decontate de către CASMB
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="rounded-lg border border-dark-200 bg-white p-4">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAnalysisMode("package");
                            setSelectedCustomTests([]);
                          }}
                          className={`rounded-lg px-4 py-2 text-14-medium transition ${
                            analysisMode === "package"
                              ? "bg-green-500 text-white"
                              : "border border-dark-200 bg-white text-dark-700 hover:bg-gray-50"
                          }`}
                        >
                          Pachet predefinit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAnalysisMode("custom");
                            setSelectedAnalysisPackage("");
                            form.setValue("analysisPackage", "");
                          }}
                          className={`rounded-lg px-4 py-2 text-14-medium transition ${
                            analysisMode === "custom"
                              ? "bg-green-500 text-white"
                              : "border border-dark-200 bg-white text-dark-700 hover:bg-gray-50"
                          }`}
                        >
                          Pachet personalizat
                        </button>
                      </div>

                      {analysisMode === "package" ? (
                        <FormField
                          control={form.control}
                          name="analysisPackage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pachet Analize Medicale</FormLabel>
                              <FormControl>
                                <Select
                                  value={selectedAnalysisPackage}
                                  onValueChange={(value) => {
                                    setSelectedAnalysisPackage(value);
                                    field.onChange(value);
                                  }}
                                >
                                  <SelectTrigger className="shad-select-trigger">
                                    <SelectValue placeholder="Selectează un pachet de analize" />
                                  </SelectTrigger>
                                  <SelectContent className="shad-select-content max-h-[400px]">
                                    {filteredAnalysisPackages.map((pkg) => (
                                      <SelectItem key={pkg.id} value={pkg.id}>
                                        <div className="flex flex-col gap-1 py-1">
                                          <p className="text-14-semibold text-dark-700">{pkg.name}</p>
                                          <p className="text-12-regular text-dark-500">
                                            {pkg.description}
                                          </p>
                                          <div className="mt-1">
                                            {!isInsured ? (
                                              <p className="text-14-medium font-semibold text-green-500">
                                                {pkg.price} RON
                                              </p>
                                            ) : (
                                              <p className="text-14-medium font-semibold text-green-500">
                                                Decontat de CASMB
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-14-semibold text-dark-700">Analize individuale</p>
                              <p className="text-12-regular text-dark-500">
                                Selectează analizele dorite și aplicația va construi automat pachetul tău.
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-12-regular text-dark-500">
                                {selectedCustomTests.length} selectate
                              </p>
                              <p className="text-16-semibold text-green-500">
                                {isInsured ? "Decontat de CASMB" : `${customTestsTotalPrice} RON`}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {filteredCustomAnalysisTests.map((test) => {
                              const checked = selectedCustomTests.includes(test.name);
                              return (
                                <label
                                  key={test.id}
                                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                                    checked
                                      ? "border-green-300 bg-green-50"
                                      : "border-dark-200 bg-white hover:bg-gray-50"
                                  }`}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) => toggleCustomTest(test.name, Boolean(value))}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-14-medium text-dark-700">{test.name}</p>
                                    <p className="text-12-regular text-dark-500">
                                      {isInsured ? "Decontat de CASMB" : `${test.price} RON`}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Afișează detaliile pachetului selectat */}
                {selectedAnalysisPackage && selectedSpecialty === "Analize medicale" && analysisMode === "package" && (
                  <div className="rounded-lg border border-dark-200 bg-white p-6">
                    {(() => {
                      const selectedPkg = AnalysisPackages.find(
                        (pkg) => pkg.id === selectedAnalysisPackage
                      );
                      if (!selectedPkg) return null;
                      return (
                        <div className="space-y-4">
                          <div>
                            <p className="text-18-semibold text-dark-700 mb-2">
                              {selectedPkg.name}
                            </p>
                            <p className="text-14-regular text-dark-600 mb-4">
                              {selectedPkg.description}
                            </p>
                            <div className="flex items-center">
                              {!isInsured ? (
                                <p className="text-20-semibold text-green-500">
                                  {selectedPkg.price} RON
                                </p>
                              ) : (
                                <p className="text-18-semibold text-green-500">
                                  Decontat de Casa de Asigurări de Sănătate
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-14-semibold text-dark-700 mb-2">
                              Analize incluse:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              {selectedPkg.tests.map((test, i) => (
                                <li key={i} className="text-14-regular text-dark-600">
                                  {test}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {selectedSpecialty === "Analize medicale" && analysisMode === "custom" && selectedCustomTests.length > 0 && (
                  <div className="rounded-lg border border-dark-200 bg-white p-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-18-semibold text-dark-700 mb-2">
                            Pachet personalizat de analize
                          </p>
                          <p className="text-14-regular text-dark-600">
                            Pachet generat din analizele selectate individual de pacient.
                          </p>
                        </div>
                        <div className="text-right">
                          {!isInsured ? (
                            <p className="text-20-semibold text-green-500">{customTestsTotalPrice} RON</p>
                          ) : (
                            <p className="text-18-semibold text-green-500">
                              Decontat de Casa de Asigurări de Sănătate
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-14-semibold text-dark-700 mb-2">
                          Analize selectate:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedCustomTests.map((test) => (
                            <li key={test} className="text-14-regular text-dark-600">
                              {test}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Afișează selectorul de doctori pentru toate specializările, inclusiv Analize medicale */}
                {selectedSpecialty && filteredDoctors.length > 0 && (
                  <>
                    <FormField
                      control={form.control}
                      name="primaryPhysician"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="shad-input-label">Doctor</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="shad-select-trigger">
                                <SelectValue placeholder="Selectează un doctor">
                                  {field.value && (() => {
                                    const selectedDoctor = filteredDoctors.find((d) => d.name === field.value);
                                    return selectedDoctor ? (
                                      <div className="flex items-center gap-2">
                                        <div className="relative flex-shrink-0">
                                          <div className="size-8 overflow-hidden rounded-full border border-dark-300">
                                            <Image
                                              src={selectedDoctor.image}
                                              width={32}
                                              height={32}
                                              alt="doctor"
                                              className="h-full w-full object-cover object-center"
                                            />
                                          </div>
                                        </div>
                                        <span>{selectedDoctor.name}</span>
                                      </div>
                                    ) : null;
                                  })()}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="shad-select-content">
                                {filteredDoctors.map((doctor, i) => {
                                  const dr = doctorRatings?.[doctor.name];
                                  return (
                                    <SelectItem key={doctor.name + i} value={doctor.name}>
                                      <div className="flex cursor-pointer items-center gap-2">
                                        <div className="relative flex-shrink-0">
                                          <div className="size-8 overflow-hidden rounded-full border border-dark-300">
                                            <Image
                                              src={doctor.image}
                                              width={32}
                                              height={32}
                                              alt="doctor"
                                              className="h-full w-full object-cover object-center"
                                            />
                                          </div>
                                        </div>
                                        <p>{doctor.name}</p>
                                        {dr && dr.count > 0 && (
                                          <span className="ml-auto flex items-center gap-0.5 text-12-regular text-amber-600">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2">
                                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                            {dr.average}
                                          </span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="shad-error" />
                        </FormItem>
                      )}
                    />
                    
                    {/* Afișează metadatele doctorului selectat */}
                    {watchedDoctor && (() => {
                      const selectedDoctor = filteredDoctors.find((d) => d.name === watchedDoctor);
                      return selectedDoctor ? (
                        <DoctorInfoCard doctor={selectedDoctor} />
                      ) : null;
                    })()}

                    {/* Tip programare: la cabinet sau videoconferință (doar pentru consultații cu doctor, nu pentru analize) */}
                    {watchedDoctor && selectedSpecialty !== "Analize medicale" && (
                      <FormField
                        control={form.control}
                        name="appointmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="shad-input-label">Tip programare</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="shad-select-trigger">
                                  <SelectValue placeholder="Alege tipul" />
                                </SelectTrigger>
                                <SelectContent className="shad-select-content">
                                  <SelectItem value="in_person">La cabinet</SelectItem>
                                  <SelectItem value="video">Videoconferință</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
                {selectedSpecialty && filteredDoctors.length === 0 && (
                  <p className="text-14-regular text-dark-500">
                    Nu există doctori disponibili pentru această specializare.
                  </p>
                )}
              </>
            ) : (
              <FormField
                control={form.control}
                name="primaryPhysician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-input-label">Doctor</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="shad-select-trigger">
                          <SelectValue placeholder="Selectează un doctor">
                            {field.value && (() => {
                              const selectedDoctor = Doctors.find((d) => d.name === field.value);
                              return selectedDoctor ? (
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-shrink-0">
                                    <div className="size-8 overflow-hidden rounded-full border border-dark-300">
                                      <Image
                                        src={selectedDoctor.image}
                                        width={32}
                                        height={32}
                                        alt="doctor"
                                        className="h-full w-full object-cover object-center"
                                      />
                                    </div>
                                  </div>
                                  <span>{selectedDoctor.name}</span>
                                </div>
                              ) : null;
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="shad-select-content">
                          {Doctors.map((doctor, i) => (
                            <SelectItem key={doctor.name + i} value={doctor.name}>
                              <div className="flex cursor-pointer items-center gap-2">
                                <div className="relative flex-shrink-0">
                                  <div className="size-8 overflow-hidden rounded-full border border-dark-300">
                                    <Image
                                      src={doctor.image}
                                      width={32}
                                      height={32}
                                      alt="doctor"
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>
                                </div>
                                <p>{doctor.name}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="shad-error" />
                  </FormItem>
                )}
              />
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
                {/* Slot Selector - pentru toate programările cu doctor (inclusiv analize medicale cu doctor) */}
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
                            userId={type === "create" ? userId : undefined}
                            patientId={type === "create" ? patientId : undefined}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Mesaj pentru analize medicale fără doctor selectat */}
                {selectedSpecialty === "Analize medicale" && hasAnalysisSelection && !watchedDoctor && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-14-regular text-dark-700">
                      Pentru analize medicale, vă rugăm să selectați data programării. Programările pentru analize se fac de luni până vineri, între orele 10:00-20:00.
                    </p>
                  </div>
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
