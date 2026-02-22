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
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start justify-between">
            Acces medic
            <button
              type="button"
              onClick={closeModal}
              className="rounded p-1 hover:bg-gray-100"
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
          <AlertDialogDescription>
            Introduceți codul unic de 4 cifre pentru a accesa panoul de medic. Veți vedea doar programările și datele dvs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <InputOTP
            maxLength={4}
            value={code}
            onChange={(value) => setCode(value)}
          >
            <InputOTPGroup className="shad-otp">
              <InputOTPSlot className="shad-otp-slot" index={0} />
              <InputOTPSlot className="shad-otp-slot" index={1} />
              <InputOTPSlot className="shad-otp-slot" index={2} />
              <InputOTPSlot className="shad-otp-slot" index={3} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <p className="shad-error text-14-regular mt-4 flex justify-center">
              {error}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isLoading || code.replace(/\D/g, "").length !== 4}
            className="shad-primary-btn w-full"
          >
            {isLoading ? "Se verifică..." : "Intră în panou"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
