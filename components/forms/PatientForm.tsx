"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/actions/patient.actions";
import { setSessionAfterRegistration } from "@/lib/actions/auth.actions";
import { UserFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";

export const PatientForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Submitting form with values:", { name: values.name, email: values.email, password: "***" });

      const user = {
        name: values.name,
        email: values.email,
        password: values.password,
      };

      console.log("Calling createUser...");
      const newUser = await createUser(user);
      
      console.log("Created user response:", newUser);

      if (newUser && newUser.$id) {
        console.log("User created successfully, setting session...");
        // Setează sesiunea automat după crearea user-ului
        const sessionResult = await setSessionAfterRegistration(newUser.$id);
        
        if (sessionResult.error) {
          console.error("Failed to set session:", sessionResult.error);
          setError("Utilizatorul a fost creat, dar a apărut o eroare la autentificare. Vă rugăm să vă conectați manual.");
          return;
        }

        console.log("Session set successfully, redirecting...");
        const redirectPath = `/patients/${newUser.$id}/register`;
        // Folosim window.location pentru a forța reîncărcarea completă
        window.location.href = redirectPath;
      } else {
        console.error("Failed to create user or user ID is missing. User object:", newUser);
        setError("Eroare la crearea utilizatorului. Vă rugăm să încercați din nou.");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage = error?.message || "A apărut o eroare. Vă rugăm să încercați din nou.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        <section className="mb-12 space-y-4">
          <h1 className="header">Bună ziua 👋</h1>
          <p className="text-dark-600">
            Prima platformă de management spital din România. Gestionare programări, înregistrări pacienți și multe altele.
          </p>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-14-regular text-red-600">{error}</p>
          </div>
        )}

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Nume complet"
          placeholder="Darius Brinzan"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="dbrinzan@gmail.com"
          iconSrc="/assets/icons/email.svg"
          iconAlt="email"
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parolă</FormLabel>
              <FormControl>
                <div className="flex rounded-md border border-dark-200 bg-white">
                  <Input
                    type="password"
                    placeholder="Minim 6 caractere"
                    {...field}
                    className="shad-input border-0"
                  />
                </div>
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
