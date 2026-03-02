import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/LoginForm";
import { PasskeyModal } from "@/components/PasskeyModal";
import { DoctorCodeModalWrapper } from "@/components/DoctorCodeModalWrapper";
import { LogoLink } from "@/components/LogoLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminSession, getDoctorSession } from "@/lib/actions/auth.actions";

const Home = async ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";
  const isDoctor = searchParams?.doctor === "true";

  // Nu permite niciodată email/parolă în URL (securitate)
  if (searchParams?.email != null || searchParams?.password != null) {
    const safe: string[] = [];
    if (isAdmin) safe.push("admin=true");
    if (isDoctor) safe.push("doctor=true");
    redirect(safe.length ? `/?${safe.join("&")}` : "/");
  }

  if (isAdmin && (await getAdminSession())) redirect("/admin");
  if (isDoctor && (await getDoctorSession())) redirect("/doctor");

  return (
    <div className="flex h-screen max-h-screen bg-slate-50 dark:bg-slate-950">
      {isAdmin && <PasskeyModal />}
      {isDoctor && <DoctorCodeModalWrapper />}

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[480px]">
          <LogoLink />

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="p-6 sm:p-8">
              <LoginForm />
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Nu ai cont?
            </p>
            <Button asChild className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm">
              <Link href="/register">
                Înregistrează-te ca pacient nou
              </Link>
            </Button>
          </div>

          <div className="text-sm mt-16 flex flex-col items-center gap-3 sm:flex-row sm:justify-between text-slate-500 dark:text-slate-400">
            <p className="xl:text-left">© 2026 eHealth.ro</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/faq" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                Întrebări frecvente
              </Link>
              <Link href="/?doctor=true" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                Medic
              </Link>
              <Link href="/?admin=true" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
                Administrator
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Image
        src="/assets/images/imag_health.png"
        height={1500}
        width={1500}
        alt="health"
        className="side-img max-w-[50%]"
        quality={100}
        priority
      />
    </div>
  );
};

export default Home;
