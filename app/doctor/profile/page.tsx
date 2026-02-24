import { DoctorDetails } from "@/components/DoctorDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Doctors } from "@/constants";
import { getDoctorSession } from "@/lib/actions/auth.actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DoctorProfilePage() {
  const doctorName = await getDoctorSession();
  if (!doctorName) {
    redirect("/doctor/login");
  }

  const doctor = Doctors.find((entry) => entry.name === doctorName);
  if (!doctor) {
    redirect("/doctor");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Profil medic</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Metadatele doctorului
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

      <section>
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
    </div>
  );
}
