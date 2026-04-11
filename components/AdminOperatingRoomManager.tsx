"use client";

import { Building2, CreditCard, Scissors, ShieldPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

type SurgeryCaseBundle = {
  caseItem: SurgeryCase;
  anesthesiaConsult: AnesthesiaConsultation | null;
  booking: SurgeryBooking | null;
  financial: SurgeryFinancialCase | null;
};

interface AdminOperatingRoomManagerProps {
  rooms: OperatingRoom[];
  surgeryCases: SurgeryCaseBundle[];
  upcomingBookings: SurgeryBooking[];
}

function toLocalInput(value?: Date | string | null) {
  const date = value ? new Date(value) : new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

function roomStatusLabel(status: OperatingRoomStatus) {
  switch (status) {
    case "reserved":
      return "Rezervată";
    case "in_use":
      return "În utilizare";
    case "cleaning":
      return "Curățenie";
    case "maintenance":
      return "Mentenanță";
    default:
      return "Disponibilă";
  }
}

function caseStatusLabel(status: SurgeryCaseStatus) {
  switch (status) {
    case "anesthesia_pending":
      return "ATI necesar";
    case "ready_to_schedule":
      return "Pregătit de planificare";
    case "scheduled":
      return "Planificat";
    case "completed":
      return "Finalizat";
    case "cancelled":
      return "Anulat";
    default:
      return "Propus";
  }
}

export function AdminOperatingRoomManager({
  rooms,
  surgeryCases,
  upcomingBookings,
}: AdminOperatingRoomManagerProps) {
  const router = useRouter();
  const [roomSavingId, setRoomSavingId] = useState<string | null>(null);
  const [bookingSavingId, setBookingSavingId] = useState<string | null>(null);
  const [financeSavingId, setFinanceSavingId] = useState<string | null>(null);

  const [roomStatuses, setRoomStatuses] = useState<Record<string, OperatingRoomStatus>>(
    Object.fromEntries(rooms.map((room) => [room.$id, room.status]))
  );

  const [bookingForms, setBookingForms] = useState<Record<string, {
    roomId: string;
    scheduledStart: string;
    scheduledEnd: string;
    surgeonName: string;
    anesthesiologistName: string;
    nursingTeam: string;
    supportTeam: string;
    bookingStatus: SurgeryBookingStatus;
    preOpChecklist: string;
    postopDestination: string;
  }>>(() =>
    Object.fromEntries(
      surgeryCases.map(({ caseItem, booking, anesthesiaConsult }) => {
        const start = booking?.scheduledStart || caseItem.preferredDate || new Date();
        const end = booking?.scheduledEnd || new Date(new Date(start).getTime() + caseItem.estimatedDurationMinutes * 60 * 1000);
        return [
          caseItem.$id,
          {
            roomId: booking?.roomId || rooms.find((room) => room.status === "available")?.$id || rooms[0]?.$id || "",
            scheduledStart: toLocalInput(start),
            scheduledEnd: toLocalInput(end),
            surgeonName: booking?.surgeonName || caseItem.requestedByDoctor,
            anesthesiologistName: booking?.anesthesiologistName || anesthesiaConsult?.anesthesiologistName || "",
            nursingTeam: booking?.nursingTeam || "",
            supportTeam: booking?.supportTeam || "",
            bookingStatus: booking?.bookingStatus || "planned",
            preOpChecklist: booking?.preOpChecklist || "",
            postopDestination: booking?.postopDestination || (caseItem.requiresICUBed ? "ATI" : "Secție"),
          },
        ];
      })
    )
  );

  const [financeForms, setFinanceForms] = useState<Record<string, {
    coverageType: SurgeryCoverageType;
    estimatedTotal: string;
    cassCoveredAmount: string;
    patientAmount: string;
    paymentStatus: SurgeryPaymentStatus;
    billingNotes: string;
  }>>(() =>
    Object.fromEntries(
      surgeryCases.map(({ caseItem, financial }) => [
        caseItem.$id,
        {
          coverageType: financial?.coverageType || "cass_full",
          estimatedTotal: String(financial?.estimatedTotal ?? 0),
          cassCoveredAmount: String(financial?.cassCoveredAmount ?? 0),
          patientAmount: String(financial?.patientAmount ?? 0),
          paymentStatus: financial?.paymentStatus || "pending",
          billingNotes: financial?.billingNotes || "",
        },
      ])
    )
  );

  const summary = useMemo(() => ({
    totalRooms: rooms.length,
    availableRooms: rooms.filter((room) => room.status === "available").length,
    readyToSchedule: surgeryCases.filter(({ caseItem }) => caseItem.status === "ready_to_schedule").length,
    scheduledCases: surgeryCases.filter(({ caseItem }) => caseItem.status === "scheduled").length,
  }), [rooms, surgeryCases]);

  const handleRoomStatusSave = async (roomId: string) => {
    setRoomSavingId(roomId);
    try {
      const response = await fetch(`/api/admin/operating-rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: roomStatuses[roomId] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut actualiza statusul sălii.");
      }
      toast.success("Statusul sălii a fost actualizat.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la actualizarea sălii.");
    } finally {
      setRoomSavingId(null);
    }
  };

  const handleBookingSave = async (caseId: string) => {
    const form = bookingForms[caseId];
    if (!form?.roomId) {
      toast.error("Selectează o sală operatorie.");
      return;
    }

    setBookingSavingId(caseId);
    try {
      const response = await fetch(`/api/surgery/cases/${caseId}/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: form.roomId,
          scheduledStart: new Date(form.scheduledStart).toISOString(),
          scheduledEnd: new Date(form.scheduledEnd).toISOString(),
          surgeonName: form.surgeonName,
          anesthesiologistName: form.anesthesiologistName,
          nursingTeam: form.nursingTeam,
          supportTeam: form.supportTeam,
          bookingStatus: form.bookingStatus,
          preOpChecklist: form.preOpChecklist,
          postopDestination: form.postopDestination,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva rezervarea.");
      }
      toast.success("Cazul operator a fost programat.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la programarea sălii.");
    } finally {
      setBookingSavingId(null);
    }
  };

  const handleFinanceSave = async (caseId: string) => {
    const form = financeForms[caseId];
    setFinanceSavingId(caseId);
    try {
      const response = await fetch(`/api/surgery/cases/${caseId}/financial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverageType: form.coverageType,
          estimatedTotal: Number(form.estimatedTotal),
          cassCoveredAmount: Number(form.cassCoveredAmount),
          patientAmount: Number(form.patientAmount),
          paymentStatus: form.paymentStatus,
          billingNotes: form.billingNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Nu am putut salva situația financiară.");
      }
      toast.success("Situația financiară a fost actualizată.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Eroare la actualizarea situației financiare.");
    } finally {
      setFinanceSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Săli operatorii</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{summary.totalRooms}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Săli disponibile</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{summary.availableRooms}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pregătite pentru planificare</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600 dark:text-amber-400">{summary.readyToSchedule}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Intervenții programate</p>
            <p className="mt-2 text-3xl font-semibold text-teal-600 dark:text-teal-400">{summary.scheduledCases}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <Building2 className="size-5" />
            <p className="text-sm font-medium">Săli operatorii</p>
          </div>
          <CardTitle>Disponibilitate și status logistic</CardTitle>
          <CardDescription>
            Statusul este util pentru programări, curățenie între cazuri și scoaterea temporară din uz.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.$id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{room.roomNumber}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{room.specialty} · Etaj {room.floor}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {roomStatusLabel(room.status)}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>Stație ATI: {room.hasAnesthesiaMachine ? "Da" : "Nu"}</p>
                <p>Suport imagistic: {room.hasImagingSupport ? "Da" : "Nu"}</p>
                {room.notes && <p>{room.notes}</p>}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Select
                  value={roomStatuses[room.$id]}
                  onValueChange={(value: OperatingRoomStatus) =>
                    setRoomStatuses((prev) => ({ ...prev, [room.$id]: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponibilă</SelectItem>
                    <SelectItem value="reserved">Rezervată</SelectItem>
                    <SelectItem value="in_use">În utilizare</SelectItem>
                    <SelectItem value="cleaning">Curățenie</SelectItem>
                    <SelectItem value="maintenance">Mentenanță</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRoomStatusSave(room.$id)}
                  disabled={roomSavingId === room.$id}
                >
                  {roomSavingId === room.$id ? "..." : "Actualizează"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <Scissors className="size-5" />
            <p className="text-sm font-medium">Planificare operatorie</p>
          </div>
          <CardTitle>Cazuri primite de la medici</CardTitle>
          <CardDescription>
            Flux complet: verificare ATI, estimare decontare CASS / coplată și rezervare pe sală.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {surgeryCases.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu există încă solicitări de intervenții chirurgicale.
            </p>
          ) : (
            surgeryCases.map(({ caseItem, anesthesiaConsult, booking, financial }) => {
              const bookingForm = bookingForms[caseItem.$id];
              const financeForm = financeForms[caseItem.$id];

              return (
                <div
                  key={caseItem.$id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {caseItem.procedureName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {caseItem.patient?.name} · {caseItem.requestedByDoctor} · {caseItem.surgicalSpecialty}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {caseStatusLabel(caseItem.status)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-400 lg:grid-cols-2">
                    <p>Diagnostic: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.diagnosis}</span></p>
                    <p>Dată preferată: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.preferredDate ? formatDateTime(caseItem.preferredDate).dateTime : "Nespecificată"}</span></p>
                    <p>Durată estimată: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.estimatedDurationMinutes} min</span></p>
                    <p>ATI postoperator: <span className="font-medium text-slate-800 dark:text-slate-200">{caseItem.requiresICUBed ? "Da" : "Nu"}</span></p>
                    <p>Consult ATI: <span className="font-medium text-slate-800 dark:text-slate-200">{anesthesiaConsult ? `${anesthesiaConsult.clearanceStatus} (${anesthesiaConsult.asaRisk})` : "Lipsește"}</span></p>
                    <p>Financiar: <span className="font-medium text-slate-800 dark:text-slate-200">{financial ? `${financial.coverageType} / ${financial.paymentStatus}` : "Neconfigurat"}</span></p>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <ShieldPlus className="size-4" />
                        <h4 className="text-sm font-semibold">Rezervare sală și echipă</h4>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Select
                          value={bookingForm.roomId}
                          onValueChange={(value) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, roomId: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sala operatorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((room) => (
                              <SelectItem key={room.$id} value={room.$id}>
                                {room.roomNumber} · {room.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={bookingForm.bookingStatus}
                          onValueChange={(value: SurgeryBookingStatus) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, bookingStatus: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planificat</SelectItem>
                            <SelectItem value="confirmed">Confirmat</SelectItem>
                            <SelectItem value="in_progress">În curs</SelectItem>
                            <SelectItem value="completed">Finalizat</SelectItem>
                            <SelectItem value="cancelled">Anulat</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="datetime-local"
                          value={bookingForm.scheduledStart}
                          onChange={(event) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, scheduledStart: event.target.value },
                            }))
                          }
                        />
                        <Input
                          type="datetime-local"
                          value={bookingForm.scheduledEnd}
                          onChange={(event) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, scheduledEnd: event.target.value },
                            }))
                          }
                        />
                        <Input
                          value={bookingForm.surgeonName}
                          onChange={(event) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, surgeonName: event.target.value },
                            }))
                          }
                          placeholder="Operator principal"
                        />
                        <Input
                          value={bookingForm.anesthesiologistName}
                          onChange={(event) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, anesthesiologistName: event.target.value },
                            }))
                          }
                          placeholder="Medic anestezist"
                        />
                        <Input
                          value={bookingForm.nursingTeam}
                          onChange={(event) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, nursingTeam: event.target.value },
                            }))
                          }
                          placeholder="Asistentă instrumentară / circulantă"
                        />
                        <Input
                          value={bookingForm.supportTeam}
                          onChange={(event) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, supportTeam: event.target.value },
                            }))
                          }
                          placeholder="Brancardier / sterilizare / tehnic"
                        />
                        <Input
                          value={bookingForm.postopDestination}
                          onChange={(event) =>
                            setBookingForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...bookingForm, postopDestination: event.target.value },
                            }))
                          }
                          placeholder="Destinație postoperatorie"
                        />
                        <div className="md:col-span-2">
                          <Textarea
                            rows={3}
                            value={bookingForm.preOpChecklist}
                            onChange={(event) =>
                              setBookingForms((prev) => ({
                                ...prev,
                                [caseItem.$id]: { ...bookingForm, preOpChecklist: event.target.value },
                              }))
                            }
                            placeholder="Ex: analize în termen, grupă și RH, profilaxie antibiotică, evaluare imagistică, material steril."
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          type="button"
                          onClick={() => handleBookingSave(caseItem.$id)}
                          disabled={bookingSavingId === caseItem.$id}
                        >
                          {bookingSavingId === caseItem.$id ? "Se salvează..." : "Salvează rezervarea"}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <CreditCard className="size-4" />
                        <h4 className="text-sm font-semibold">Decontare și plată</h4>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Select
                          value={financeForm.coverageType}
                          onValueChange={(value: SurgeryCoverageType) =>
                            setFinanceForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...financeForm, coverageType: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cass_full">CASS integral</SelectItem>
                            <SelectItem value="cass_partial">CASS parțial</SelectItem>
                            <SelectItem value="private_full">Integral privat</SelectItem>
                            <SelectItem value="mixed">Mixt</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={financeForm.paymentStatus}
                          onValueChange={(value: SurgeryPaymentStatus) =>
                            setFinanceForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...financeForm, paymentStatus: value },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">În așteptare</SelectItem>
                            <SelectItem value="partially_paid">Parțial achitat</SelectItem>
                            <SelectItem value="paid">Achitat</SelectItem>
                            <SelectItem value="exempt">Scutit</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={financeForm.estimatedTotal}
                          onChange={(event) =>
                            setFinanceForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...financeForm, estimatedTotal: event.target.value },
                            }))
                          }
                          placeholder="Cost estimat total"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={financeForm.cassCoveredAmount}
                          onChange={(event) =>
                            setFinanceForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...financeForm, cassCoveredAmount: event.target.value },
                            }))
                          }
                          placeholder="Acoperire CASS"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={financeForm.patientAmount}
                          onChange={(event) =>
                            setFinanceForms((prev) => ({
                              ...prev,
                              [caseItem.$id]: { ...financeForm, patientAmount: event.target.value },
                            }))
                          }
                          placeholder="Diferență pacient"
                        />
                        <div className="md:col-span-2">
                          <Textarea
                            rows={3}
                            value={financeForm.billingNotes}
                            onChange={(event) =>
                              setFinanceForms((prev) => ({
                                ...prev,
                                [caseItem.$id]: { ...financeForm, billingNotes: event.target.value },
                              }))
                            }
                            placeholder="Ex: implant neacoperit de CASS, coplată pentru rezervă, consumabile premium."
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleFinanceSave(caseItem.$id)}
                          disabled={financeSavingId === caseItem.$id}
                        >
                          {financeSavingId === caseItem.$id ? "Se salvează..." : "Salvează financiar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>Programări operatorii viitoare</CardTitle>
          <CardDescription>
            Vizualizare rapidă a rezervărilor deja introduse în blocul operator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu există rezervări operatorii programate în acest moment.
            </p>
          ) : (
            upcomingBookings.map((booking) => (
              <div
                key={booking.$id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {booking.room?.roomNumber || "Sală"} · {booking.surgeonName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDateTime(booking.scheduledStart).dateTime} - {formatDateTime(booking.scheduledEnd).timeOnly}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {booking.bookingStatus}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
