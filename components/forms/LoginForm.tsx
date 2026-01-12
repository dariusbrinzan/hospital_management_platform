"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginPatient } from "@/lib/actions/auth.actions";
import SubmitButton from "../SubmitButton";

const LoginValidation = z.object({
  email: z.string().email("Adresă email invalidă"),
  password: z.string().min(1, "Parola este obligatorie"),
});

export const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof LoginValidation>>({
    resolver: zodResolver(LoginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginValidation>) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await loginPatient(values.email, values.password);

      if (result.error) {
        setError(result.error);
      } else if (result.success && result.userId) {
        // Dacă pacientul nu este complet înregistrat, redirecționează la register
        if (result.needsRegistration) {
          router.push(`/patients/${result.userId}/register`);
        } else {
          router.push(`/patients/${result.userId}/dashboard`);
        }
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("A apărut o eroare la autentificare");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-14-regular text-red-600">{error}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="dbrinzan@gmail.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parolă</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Introduceți parola"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton isLoading={isLoading}>Începe</SubmitButton>
      </form>
    </Form>
  );
};
