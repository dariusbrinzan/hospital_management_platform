"use client";

import { useRouter } from "next/navigation";
import { DoctorCodeModal } from "./DoctorCodeModal";
import { useState, useEffect } from "react";

export const DoctorCodeModalWrapper = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) router.push("/");
  };

  if (!mounted) return null;

  return (
    <DoctorCodeModal
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
};
