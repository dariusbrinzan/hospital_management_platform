import Link from "next/link";
import { redirect } from "next/navigation";

import { DoctorDetails } from "@/components/DoctorDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Doctors } from "@/constants";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import { doctorReviewHelpers } from "@/lib/db-helpers";
import { formatDateTime } from "@/lib/utils";

export default async function DoctorProfilePage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) {
    redirect("/doctor/login");
  }

  const doctor = Doctors.find((entry) => entry.name === doctorName);
  if (!doctor) {
    redirect("/doctor");
  }

  const [reviews, ratingSummary] = await Promise.all([
    Promise.resolve(doctorReviewHelpers.getByDoctorName(doctor.name)),
    Promise.resolve(doctorReviewHelpers.getAverageRating(doctor.name)),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Profil medic</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Profilul dumneavoastră
          </h1>
        </div>
        <Link
          href="/doctor"
          prefetch={false}
          className="inline-flex items-center justify-center rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-700 shadow-sm transition hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-950/50"
        >
          Înapoi la programări
        </Link>
      </section>

      <section className="mb-6">
        <DoctorDetails doctor={doctor} />
      </section>

      <section className="mb-6">
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Informații administrative</CardTitle>
            <CardDescription>Detalii utile pentru contextul operațional al medicului.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Specializare principală</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{doctor.specialty}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">ID medic</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{doctor.id}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Evaluările pacienților</CardTitle>
            <CardDescription>
              Recenziile trimise de pacienți după consultațiile finalizate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Rating mediu</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {ratingSummary.average.toFixed(1)}
                  <span className="ml-1 text-base font-medium text-amber-500">/5</span>
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Număr evaluări</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{ratingSummary.count}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ultima evaluare</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {reviews[0] ? formatDateTime(reviews[0].createdAt).dateOnly : "Nu există încă"}
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Nu există încă review-uri pentru acest profil.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.$id}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Evaluare pacient
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(review.createdAt).dateTime}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={star <= review.rating ? "#f59e0b" : "none"}
                            stroke={star <= review.rating ? "#f59e0b" : "#94a3b8"}
                            strokeWidth="2"
                            aria-hidden
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm font-semibold text-amber-600">{review.rating}/5</span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {review.comment?.trim() ? `„${review.comment}”` : "Pacientul a lăsat doar scorul, fără comentariu."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
