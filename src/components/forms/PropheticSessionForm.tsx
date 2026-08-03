"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  propheticSessionSchema,
  type PropheticSessionValues,
} from "@/lib/validation/propheticSession";
import {
  TextField,
  TextareaField,
  RadioGroupField,
  CheckboxField,
  FormAlert,
} from "@/components/forms/FormElements";

const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export default function PropheticSessionForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropheticSessionValues>({
    resolver: zodResolver(propheticSessionSchema),
  });

  const onSubmit = async (values: PropheticSessionValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/prophetic-session", {
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
      {/* Honeypot field for spam protection — kept hidden from real users */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="honeypot-prophetic">Leave this field empty</label>
        <input
          id="honeypot-prophetic"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          ref={honeypotRef}
        />
      </div>

      {status === "success" && (
        <FormAlert variant="success">
          Thank you for your request. Our team will prayerfully review your
          information and contact you regarding availability and next steps.
        </FormAlert>
      )}
      {status === "error" && (
        <FormAlert variant="error">
          Something went wrong submitting your request. Please try again, or
          reach out to us directly via the Contact page.
        </FormAlert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="fullName"
          label="Full name"
          required
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <TextField
          id="email"
          label="Email address"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />
        <TextField
          id="cityCountry"
          label="City and country"
          required
          error={errors.cityCountry?.message}
          {...register("cityCountry")}
        />
      </div>

      <TextField
        id="churchAffiliation"
        label="Church or ministry affiliation"
        hint="Optional"
        error={errors.churchAffiliation?.message}
        {...register("churchAffiliation")}
      />

      <TextareaField
        id="reasonForRequest"
        label="Why are you requesting a prophetic session?"
        required
        error={errors.reasonForRequest?.message}
        {...register("reasonForRequest")}
      />

      <RadioGroupField
        legend="Have you received prophetic ministry before?"
        name="hasReceivedPropheticMinistry"
        options={yesNo}
        register={register}
        required
        error={errors.hasReceivedPropheticMinistry?.message}
      />

      <RadioGroupField
        legend="Are you comfortable with an online video session?"
        name="comfortableWithVideo"
        options={yesNo}
        register={register}
        required
        error={errors.comfortableWithVideo?.message}
      />

      <TextField
        id="availability"
        label="Preferred dates or availability"
        required
        error={errors.availability?.message}
        {...register("availability")}
      />

      <TextareaField
        id="prayerRequests"
        label="Prayer requests"
        hint="Optional"
        error={errors.prayerRequests?.message}
        {...register("prayerRequests")}
      />

      <CheckboxField
        id="ageConfirmation"
        label="I confirm that I am 18 years of age or older."
        error={errors.ageConfirmation?.message}
        {...register("ageConfirmation")}
      />

      <CheckboxField
        id="consent"
        label="I consent to being contacted by Jon and Tami Masson Ministry regarding this request."
        error={errors.consent?.message}
        {...register("consent")}
      />

      <CheckboxField
        id="disclaimerAcknowledged"
        label="I have read and understand the Ministry Disclaimer, and understand that prophetic ministry is not a replacement for Scripture, pastoral care, professional counselling, or medical advice."
        error={errors.disclaimerAcknowledged?.message}
        {...register("disclaimerAcknowledged")}
      />

      <p className="text-sm text-charcoal-light">
        This is a request only. Submitting this form does not confirm a
        booking — our team will review your request and contact you about
        availability.
      </p>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Submit Session Request"}
      </button>
    </form>
  );
}
