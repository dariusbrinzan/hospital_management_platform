import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Doctors } from "@/constants";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { Calendar, User } from "lucide-react";

const RequestSuccess = async ({
  searchParams,
  params: { userId },
}: SearchParamProps) => {
  const appointmentId = (searchParams?.appointmentId as string) || "";
  const appointment = await getAppointment(appointmentId);
  if (!appointment) redirect(`/patients/${userId}/dashboard`);
  const doctor = Doctors.find((d) => d.name === appointment.primaryPhysician);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-teal-50/30 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8">
        <Link href="/" className="self-start">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="eHealth.ro logo"
            className="h-10 w-fit"
          />
        </Link>

        <div className="flex flex-col items-center gap-6 text-center">
          <Image
            src="/assets/gifs/success.gif"
            height={240}
            width={220}
            alt="success"
            className="rounded-2xl"
          />
          <div>
            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Programare înregistrată</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Cererea de programare a fost trimisă cu succes
            </h1>
          </div>
        </div>

        <Card className="w-full border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-6">
            <p className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Detalii programare
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                {doctor?.image && (
                  <Image src={doctor.image} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
                )}
                {!doctor?.image && (
                  <div className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400">
                    <User className="size-4" />
                  </div>
                )}
                <span className="font-medium text-slate-800 dark:text-slate-200">{doctor?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 shrink-0" />
                <span>{formatDateTime(appointment.schedule).dateTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex w-full flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl bg-teal-600 text-white shadow-sm hover:bg-teal-700">
            <Link href={`/patients/${userId}/dashboard`}>Programările mele</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Link href={`/patients/${userId}/new-appointment`}>Programare nouă</Link>
          </Button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">© 2026 eHealth.ro</p>
      </div>
    </div>
  );
};

export default RequestSuccess;
