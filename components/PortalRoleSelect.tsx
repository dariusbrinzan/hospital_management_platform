"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { value: "medic", label: "Medic" },
  { value: "administrator", label: "Administrator" },
] as const;

export function PortalRoleSelect() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  const handleContinue = () => {
    if (role === "medic") router.push("/medic");
    else if (role === "administrator") router.push("/admin-login");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Rol
        </label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="mt-1.5 h-12 rounded-xl border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Selectează rolul..." />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        onClick={handleContinue}
        disabled={!role}
        className="w-full rounded-xl bg-teal-600 py-6 text-base font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        Continuă
      </Button>
    </div>
  );
}
