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
import { loginAdmin } from "@/lib/actions/auth.actions";

export const PasskeyModal = () => {
  const router = useRouter();
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    setError("");
    setPasskey("");
    router.push("/");
  };

  const validatePasskey = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const digitsOnly = passkey.replace(/\D/g, "");
    const result = await loginAdmin(digitsOnly);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setPasskey("");
    router.push("/admin");
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && closeModal()}>
      <AlertDialogContent className="auth-modal-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start justify-between text-slate-900 dark:text-slate-100">
            Acces administrator
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Închide"
            >
              <Image src="/assets/icons/close.svg" alt="" width={20} height={20} />
            </button>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
            Parola de acces administrator (4 cifre). Doar roluri administrative.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <InputOTP
            maxLength={4}
            value={passkey}
            onChange={(value) => setPasskey(value)}
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
            onClick={validatePasskey}
            disabled={passkey.replace(/\D/g, "").length !== 4 || loading}
            className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700"
          >
            {loading ? "Se verifică…" : "Introdu parola de acces"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
