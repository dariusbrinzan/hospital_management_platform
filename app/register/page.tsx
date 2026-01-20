import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PatientForm } from "@/components/forms/PatientForm";
import { getCurrentSession } from "@/lib/actions/auth.actions";
import { LogoLink } from "@/components/LogoLink";

const RegisterPage = async () => {
  // Dacă utilizatorul este deja autentificat, redirecționează la dashboard
  const session = await getCurrentSession();
  
  if (session) {
    redirect(`/patients/${session.$id}/dashboard`);
  }

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <LogoLink />

          <PatientForm />

          <div className="mt-6 text-center">
            <p className="text-14-regular text-dark-600 mb-2">
              Ai deja un cont?
            </p>
            <Link href="/" className="text-14-medium text-green-500 hover:text-green-600">
              Conectează-te aici
            </Link>
          </div>

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-dark-500 xl:text-left">
              © 2026 eHealth.ro
            </p>
            <Link href="/?admin=true" className="text-green-500 hover:text-green-600">
              Administrator
            </Link>
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
