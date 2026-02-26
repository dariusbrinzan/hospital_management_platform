import { redirect } from "next/navigation";
import { ScanSearch } from "lucide-react";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { getModalities, getStudiesOrderedByDoctor } from "@/lib/actions/imaging.actions";
import { formatDateTime } from "@/lib/utils";
import { ImagingBookingForm } from "@/components/ImagingBookingForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DoctorImagingPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/?doctor=true");

  const [modalities, myStudies] = await Promise.all([
    getModalities(),
    getStudiesOrderedByDoctor(doctorName, 30),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ScanSearch className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
            Imagistică
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Cereri imagistică
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Solicită o programare imagistică pentru un pacient și rezervă un slot. Rezervările făcute de tine apar mai jos.
        </p>
      </div>

      <section className="mb-8">
        <ImagingBookingForm
          modalities={modalities}
          asDoctor
        />
      </section>

      <section>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Programări solicitate de tine</CardTitle>
            <CardDescription>
              Investigații imagistice programate la cererea ta, în ordine cronologică.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!myStudies || myStudies.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nu ai solicitat încă nicio programare imagistică. Completează formularul de mai sus pentru a rezerva un slot pentru un pacient.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="pb-2 pr-4 text-left font-medium text-slate-700 dark:text-slate-300">
                        Pacient
                      </th>
                      <th className="pb-2 pr-4 text-left font-medium text-slate-700 dark:text-slate-300">
                        Modalitate
                      </th>
                      <th className="pb-2 pr-4 text-left font-medium text-slate-700 dark:text-slate-300">
                        Data și ora
                      </th>
                      <th className="pb-2 pr-4 text-left font-medium text-slate-700 dark:text-slate-300">
                        Status
                      </th>
                      <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">
                        Motiv
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStudies.map((s: any) => (
                      <tr
                        key={s.$id}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-3 pr-4 text-slate-900 dark:text-slate-100">
                          {s.patientName ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                          {s.modalityName ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                          {formatDateTime(s.scheduledAt).dateTime}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              s.status === "scheduled"
                                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                                : s.status === "completed"
                                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  : s.status === "cancelled"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {s.status === "scheduled"
                              ? "Programat"
                              : s.status === "completed"
                                ? "Finalizat"
                                : s.status === "cancelled"
                                  ? "Anulat"
                                  : s.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {s.reason ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
