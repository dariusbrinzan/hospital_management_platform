"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { loginDoctor } from "@/lib/actions/auth.actions";

interface DoctorCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DoctorCodeModal = ({ open, onOpenChange }: DoctorCodeModalProps) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => {
    setCode("");
    setError("");
    onOpenChange(false);
    router.push("/");
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");
    const normalized = code.replace(/\D/g, "");
    if (normalized.length !== 4) {
      setError("Introduceți un cod de exact 4 cifre.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await loginDoctor(normalized);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        onOpenChange(false);
        router.push("/doctor");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="auth-modal-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start justify-between text-slate-900 dark:text-slate-100">
            Acces medic
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Închide"
            >
              <Image
                src="/assets/icons/close.svg"
                alt=""
                width={20}
                height={20}
              />
            </button>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
            Introduceți codul unic de 4 cifre pentru a accesa panoul de medic. Veți vedea doar programările și datele dvs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <InputOTP
            maxLength={4}
            value={code}
            onChange={(value) => setCode(value)}
          >
            <InputOTPGroup className="auth-otp-group">
              <InputOTPSlot className="auth-otp-slot" index={0} />
              <InputOTPSlot className="auth-otp-slot" index={1} />
              <InputOTPSlot className="auth-otp-slot" index={2} />
              <InputOTPSlot className="auth-otp-slot" index={3} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="mt-4 flex justify-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading || code.replace(/\D/g, "").length !== 4}
            className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700"
          >
            {isLoading ? "Se verifică..." : "Intră în panou"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
