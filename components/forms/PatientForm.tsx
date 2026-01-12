"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { createUser } from "@/lib/actions/patient.actions";
import { UserFormValidation } from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";

export const PatientForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
    setIsLoading(true);

    try {
      const user = {
        name: values.name,
        email: values.email,
        phone: values.phone,
      };

      const newUser = await createUser(user);
      
      console.log("Created user:", newUser); // Debug log

      if (newUser && newUser.$id) {
        const redirectPath = `/patients/${newUser.$id}/register`;
        console.log("Redirecting to:", redirectPath); // Debug log
        // Folosim window.location pentru a forța reîncărcarea completă
        window.location.href = redirectPath;
      } else {
        console.error("Failed to create user or user ID is missing. User object:", newUser);
        alert("Eroare la crearea utilizatorului. Vă rugăm să încercați din nou.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("A apărut o eroare. Vă rugăm să încercați din nou.");
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

        <CustomFormField
          fieldType={FormFieldType.PHONE_INPUT}
          control={form.control}
          name="phone"
          label="Număr de telefon"
          placeholder="+40 712 345 678"
        />

        <SubmitButton isLoading={isLoading}>Începe</SubmitButton>
      </form>
    </Form>
  );
};
