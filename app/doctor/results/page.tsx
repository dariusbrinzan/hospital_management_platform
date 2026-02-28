import Link from "next/link";
import { redirect } from "next/navigation";
import { Beaker, FileCheck, ScanSearch } from "lucide-react";

import { getDoctorSession } from "@/lib/actions/auth.actions";
import { labResultHelpers, imagingStudyHelpers } from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsToReviewList } from "@/components/ResultsToReviewList";

export default async function DoctorResultsPage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) redirect("/?doctor=true");

  const [unreviewedLab, unreviewedImaging] = await Promise.all([
    Promise.resolve(labResultHelpers.getUnreviewedForDoctor(doctorName)),
    Promise.resolve(imagingStudyHelpers.getUnreviewedForDoctor(doctorName)),
  ]);

  const totalUnreviewed = unreviewedLab.length + unreviewedImaging.length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FileCheck className="size-5 text-teal-600 dark:text-teal-400" />
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Rezultate</p>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Rezultate noi — de văzut / semnat
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Analize și imagistică pentru pacienții tăi, recent finalizate și necomentate. Marchează ca „Văzut” sau „Semnat” și opțional adaugă o notă pentru pacient.
        </p>
        {totalUnreviewed > 0 && (
          <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
            {totalUnreviewed} rezultat{totalUnreviewed === 1 ? "" : "e"} în așteptare
          </p>
        )}
      </div>

      {totalUnreviewed === 0 ? (
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileCheck className="mx-auto mb-3 size-12 text-slate-300 dark:text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Niciun rezultat de semnat</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
              Nu ai rezultate noi (analize sau imagistică) în așteptare. Reveniți periodic pentru a verifica.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {unreviewedLab.length > 0 && (
            <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Beaker className="size-5 text-teal-600 dark:text-teal-400" />
                  Analize laborator ({unreviewedLab.length})
                </CardTitle>
                <CardDescription>Rezultate analize pentru pacienții tăi, nesemnate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsToReviewList
                  type="lab"
                  items={unreviewedLab.map((r) => ({
                    id: r.$id,
                    title: r.testName,
                    subtitle: `${r.patientName} · ${formatDateTime(r.performedDate).dateOnly}`,
                    detail: [r.resultValue && `${r.resultValue} ${r.unit ?? ""}`, r.referenceRange].filter(Boolean).join(" · ") || r.notes || "—",
                    status: r.status,
                    patientId: r.patientId,
                  }))}
                />
              </CardContent>
            </Card>
          )}

          {unreviewedImaging.length > 0 && (
            <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScanSearch className="size-5 text-teal-600 dark:text-teal-400" />
                  Imagistică ({unreviewedImaging.length})
                </CardTitle>
                <CardDescription>Studii imagistică finalizate, nesemnate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsToReviewList
                  type="imaging"
                  items={unreviewedImaging.map((s) => ({
                    id: s.$id,
                    title: s.modalityName ?? "Imagistică",
                    subtitle: `${s.patientName} · ${formatDateTime(s.scheduledAt).dateOnly}`,
                    detail: s.reason || s.resultNotes || "—",
                    status: s.status,
                    patientId: s.patientId,
                  }))}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
