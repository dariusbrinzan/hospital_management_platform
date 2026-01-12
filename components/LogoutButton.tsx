"use client";

import { useState } from "react";

import { logoutPatient } from "@/lib/actions/auth.actions";
import { Button } from "./ui/button";

export const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logoutPatient();
      if (result.success) {
        // Folosim window.location pentru a forța reîncărcarea completă
        window.location.href = "/";
      } else {
        console.error("Logout failed:", result.error);
        alert("A apărut o eroare la deconectare. Vă rugăm să încercați din nou.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("A apărut o eroare la deconectare. Vă rugăm să încercați din nou.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="text-14-medium text-dark-600 hover:text-dark-700"
    >
      {isLoading ? "Deconectare..." : "Deconectare"}
    </Button>
  );
};
