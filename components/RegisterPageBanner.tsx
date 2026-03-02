"use client";

import { useState } from "react";
import { logoutPatientAndGoToRegister } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";

export function RegisterPageBanner({ userName }: { userName?: string }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutPatientAndGoToRegister();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <p className="text-sm text-amber-800 dark:text-amber-200">
        Ești deja autentificat{userName ? ` ca ${userName}` : ""}. Pentru a înregistra un cont nou, deloghează-te mai întâi.
      </p>
      <Button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        variant="outline"
        className="mt-3 rounded-xl border-amber-300 bg-white text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/50"
      >
        {loading ? "Se deconectează..." : "Delogare"}
      </Button>
    </div>
  );
}
