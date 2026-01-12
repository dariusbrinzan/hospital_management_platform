import Image from "next/image";
import Link from "next/link";

import { getCurrentSession } from "@/lib/actions/auth.actions";

export const LogoLink = async () => {
  const session = await getCurrentSession();
  
  // Dacă există sesiune, redirecționează la dashboard, altfel la pagina principală
  const href = session ? `/patients/${session.$id}/dashboard` : "/";

  return (
    <Link href={href} className="cursor-pointer">
      <Image
        src="/assets/icons/logo-full.svg"
        height={1000}
        width={1000}
        alt="eHealth.ro logo"
        className="mb-12 h-10 w-fit"
      />
    </Link>
  );
};
