"use client";

import { useRouter } from "next/navigation";
import { DoctorCodeModal } from "./DoctorCodeModal";
import { useState, useEffect } from "react";

export const DoctorCodeModalWrapper = ({ returnTo = "/" }: { returnTo?: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) router.push(returnTo);
  };

  if (!mounted) return null;

  return (
    <DoctorCodeModal
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
};
