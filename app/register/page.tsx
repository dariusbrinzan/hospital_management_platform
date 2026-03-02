import Image from "next/image";
import Link from "next/link";

import { PatientForm } from "@/components/forms/PatientForm";
import { RegisterPageBanner } from "@/components/RegisterPageBanner";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { LogoLink } from "@/components/LogoLink";
import { Card, CardContent } from "@/components/ui/card";

const RegisterPage = async () => {
  const session = await getCurrentSession();

  return (
    <div className="flex h-screen max-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[480px]">
          <LogoLink />

          {session && (
            <RegisterPageBanner userName={session.name} />
          )}

          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="p-6 sm:p-8">
              <PatientForm />
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Ai deja un cont?
            </p>
            <Link href="/" className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
              Conectează-te aici
            </Link>
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

export default RegisterPage;
