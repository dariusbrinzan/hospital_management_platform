"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { logoutPatient } from "@/lib/actions/auth.actions";
import { Button } from "./ui/button";

export const LogoutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutPatient();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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
