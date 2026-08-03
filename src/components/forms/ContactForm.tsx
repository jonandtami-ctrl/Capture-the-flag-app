"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactValues } from "@/lib/validation/contact";
import { TextField, TextareaField, FormAlert } from "@/components/forms/FormElements";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          honeypot: honeypotRef.current?.value ?? "",
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="honeypot-contact">Leave this field empty</label>
        <input
          id="honeypot-contact"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          ref={honeypotRef}
        />
      </div>

      {status === "success" && (
        <FormAlert variant="success">
          Thank you for reaching out. We will respond to your message as
          soon as we are able.
        </FormAlert>
      )}
      {status === "error" && (
        <FormAlert variant="error">
          Something went wrong sending your message. Please try again in a
          moment.
        </FormAlert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="contact-name"
          label="Name"
          required
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          id="contact-email"
          label="Email address"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <TextField
        id="contact-subject"
        label="Subject"
        required
        error={errors.subject?.message}
        {...register("subject")}
      />

      <TextareaField
        id="contact-message"
        label="Message"
        required
        rows={6}
        error={errors.message?.message}
        {...register("message")}
      />

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
