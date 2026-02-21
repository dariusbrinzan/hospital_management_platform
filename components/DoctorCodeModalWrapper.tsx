"use client";

import { useRouter } from "next/navigation";
import { DoctorCodeModal } from "./DoctorCodeModal";
import { useState } from "react";

export const DoctorCodeModalWrapper = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) router.push("/");
  };

  return (
    <DoctorCodeModal
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
};
