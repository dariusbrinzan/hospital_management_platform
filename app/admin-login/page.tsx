import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/actions/auth.actions";
import { PasskeyModal } from "@/components/PasskeyModal";
import { LogoLink } from "@/components/LogoLink";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-[400px]">
        <LogoLink />
        <div className="mt-8">
          <PasskeyModal returnTo="/medic" />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/portal" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
            ← Înapoi la portal administrare
          </Link>
        </p>
      </div>
      <Image
        src="/assets/images/imag_health.png"
        height={800}
        width={800}
        alt=""
        className="pointer-events-none fixed bottom-0 right-0 max-w-[45%] opacity-60"
        aria-hidden
      />
    </div>
  );
}
