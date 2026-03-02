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
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-2">
          <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Autentificare</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Bine ai revenit 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Conectează-te pentru a accesa contul tău și programările tale.
          </p>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="exemplu@email.com"
                  type="email"
                  className="rounded-xl border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-600 dark:text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300">Parolă</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Introduceți parola"
                  className="rounded-xl border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-600 dark:text-red-400" />
            </FormItem>
          )}
        />

        <SubmitButton isLoading={isLoading} className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm">
          Începe
        </SubmitButton>
      </form>
    </Form>
  );
};
