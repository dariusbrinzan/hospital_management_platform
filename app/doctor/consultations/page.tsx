import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, User, Calendar, Download } from "lucide-react";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { medicalRecordHelpers, patientHelpers } from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DoctorConsultationsPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/medic");

  const records = medicalRecordHelpers.getByDoctorName(doctorName);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
            Consultații și rapoarte
          </p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Rapoarte medicale
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Toate consultațiile efectuate de tine. Poți descărca raportul PDF pentru fiecare.
        </p>
      </div>

      {records.length === 0 ? (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-3 size-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nu ai înregistrat încă nicio consultație. Rapoarte vor apărea aici după ce completezi fișe de consultație la programări.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const patient = record.patientId
              ? (patientHelpers.getById(record.patientId) as any)
              : null;
            const patientName = patient?.name ?? "Pacient";

            return (
              <Card
                key={record.$id}
                className="border-slate-200/80 shadow-sm dark:border-slate-800"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-teal-600 dark:text-teal-400" />
                      {record.patientId ? (
                        <Link
                          href={`/doctor/patients/${record.patientId}`}
                          prefetch={false}
                          className="font-medium text-teal-700 hover:underline dark:text-teal-300"
                        >
                          {patientName}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {patientName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="size-3.5" />
                      {formatDateTime(String(record.visitDate)).dateTime}
                    </div>
                  </div>
                  {record.chiefComplaint && (
                    <CardDescription className="mt-1">
                      Motiv: {record.chiefComplaint}
                    </CardDescription>
                  )}
                  {record.assessment && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Diagnostic: {record.assessment}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/pdf/doctor/consultation/${record.$id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/40"
                  >
                    <Download className="size-4" />
                    Descarcă raport PDF
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
