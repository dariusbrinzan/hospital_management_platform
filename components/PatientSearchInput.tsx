"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect } from "react";

export const PatientSearchInput = ({ defaultValue }: { defaultValue: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus pe input la montare
    inputRef.current?.focus();
  }, []);

  const handleSearch = (value: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (value.trim()) {
        router.push(`/admin/patients?q=${encodeURIComponent(value.trim())}`);
      } else {
        router.push("/admin/patients");
      }
    }, 400);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={defaultValue}
      placeholder="Caută după nume, email, telefon sau CNP..."
      onChange={(e) => handleSearch(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
    />
  );
};
