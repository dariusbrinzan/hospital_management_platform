import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/forms/LoginForm";
import { PasskeyModal } from "@/components/PasskeyModal";
import { DoctorCodeModalWrapper } from "@/components/DoctorCodeModalWrapper";
import { LogoLink } from "@/components/LogoLink";
import { Button } from "@/components/ui/button";

const Home = async ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";
  const isDoctor = searchParams?.doctor === "true";

  return (
    <div className="flex h-screen max-h-screen">
      {isAdmin && <PasskeyModal />}
      {isDoctor && <DoctorCodeModalWrapper />}

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <LogoLink />

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-14-regular text-dark-600 mb-4">
              Nu ai cont?
            </p>
            <Button asChild className="w-full shad-primary-btn">
              <Link href="/register">
                Înregistrează-te ca pacient nou
              </Link>
            </Button>
          </div>

          <div className="text-14-regular mt-20 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-dark-500 xl:text-left">
              © 2026 eHealth.ro
            </p>
            <div className="flex items-center gap-4">
              <Link href="/?doctor=true" className="text-green-500 hover:text-green-600">
                Medic
              </Link>
              <Link href="/?admin=true" className="text-green-500 hover:text-green-600">
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
