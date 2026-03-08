import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession, getDoctorSession } from "@/lib/actions/auth.actions";
import { LogoLink } from "@/components/LogoLink";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalRoleSelect } from "@/components/PortalRoleSelect";
import { Shield } from "lucide-react";

/** Portal pentru personal medical: selectezi Medic sau Administrator, apoi ești dus la login-ul corespunzător. */
export default async function PortalPage() {
  const [adminSession, doctorSession] = await Promise.all([
    getAdminSession(),
    getDoctorSession(),
  ]);
  if (adminSession) redirect("/admin");
  if (doctorSession) redirect("/doctor");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <section className="remove-scrollbar container my-auto flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <LogoLink />

          <Card className="mt-8 border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-slate-100">
                <Shield className="size-5 text-teal-600 dark:text-teal-400" />
                Portal administrare
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Selectează rolul și continuă la autentificare.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <PortalRoleSelect />
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
              ← Înapoi la pagina de start
            </Link>
          </p>
        </div>
      </section>

      <Image
        src="/assets/images/imag_health.png"
        height={1200}
        width={1200}
        alt=""
        className="pointer-events-none fixed bottom-0 right-0 max-w-[45%] opacity-50"
        aria-hidden
      />
    </div>
  );
}
