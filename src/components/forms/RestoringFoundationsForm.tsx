"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  restoringFoundationsSchema,
  type RestoringFoundationsValues,
} from "@/lib/validation/restoringFoundations";
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

const sessionPreferenceOptions = [
  { value: "online", label: "Online" },
  { value: "in-person", label: "In person" },
  { value: "either", label: "Either" },
];

export default function RestoringFoundationsForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RestoringFoundationsValues>({
    resolver: zodResolver(restoringFoundationsSchema),
  });

  const onSubmit = async (values: RestoringFoundationsValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/restoring-foundations", {
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
        <label htmlFor="honeypot-rtf">Leave this field empty</label>
        <input
          id="honeypot-rtf"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          ref={honeypotRef}
        />
      </div>

      {status === "success" && (
        <FormAlert variant="success">
          Thank you for your application. Our team will prayerfully review
          your information and contact you regarding next steps.
        </FormAlert>
      )}
      {status === "error" && (
        <FormAlert variant="error">
          Something went wrong submitting your application. Please try
          again, or reach out to us directly via the Contact page.
        </FormAlert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="rtf-fullName"
          label="Full name"
          required
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <TextField
          id="rtf-email"
          label="Email address"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="rtf-phone"
          label="Phone number"
          type="tel"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />
        <TextField
          id="rtf-cityCountry"
          label="City and country"
          required
          error={errors.cityCountry?.message}
          {...register("cityCountry")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="rtf-age"
          label="Age"
          type="number"
          min={18}
          required
          error={errors.age?.message}
          {...register("age")}
        />
        <TextField
          id="rtf-churchAffiliation"
          label="Church affiliation"
          hint="Optional"
          error={errors.churchAffiliation?.message}
          {...register("churchAffiliation")}
        />
      </div>

      <TextareaField
        id="rtf-reasonForSeeking"
        label="Brief description of why you are seeking ministry"
        required
        error={errors.reasonForSeeking?.message}
        {...register("reasonForSeeking")}
      />

      <RadioGroupField
        legend="Have you previously received counselling or prayer ministry?"
        name="priorCounsellingOrPrayer"
        options={yesNo}
        register={register}
        required
        error={errors.priorCounsellingOrPrayer?.message}
      />

      <RadioGroupField
        legend="Are you currently receiving professional mental-health care?"
        name="currentMentalHealthCare"
        options={yesNo}
        register={register}
        required
        error={errors.currentMentalHealthCare?.message}
      />

      <RadioGroupField
        legend="Are you currently in crisis or immediate danger?"
        name="inCrisis"
        options={yesNo}
        register={register}
        required
        error={errors.inCrisis?.message}
      />

      <TextareaField
        id="rtf-hopingToReceive"
        label="What are you hoping to receive from the sessions?"
        required
        error={errors.hopingToReceive?.message}
        {...register("hopingToReceive")}
      />

      <TextField
        id="rtf-availability"
        label="Availability"
        required
        error={errors.availability?.message}
        {...register("availability")}
      />

      <RadioGroupField
        legend="Online or in-person preference"
        name="sessionPreference"
        options={sessionPreferenceOptions}
        register={register}
        required
        error={errors.sessionPreference?.message}
      />

      <CheckboxField
        id="rtf-consent"
        label="I consent to being contacted by Jon and Tami Masson Ministry regarding this application."
        error={errors.consent?.message}
        {...register("consent")}
      />

      <CheckboxField
        id="rtf-privacyAcknowledged"
        label="I acknowledge the Privacy Policy and understand how my information will be used and stored."
        error={errors.privacyAcknowledged?.message}
        {...register("privacyAcknowledged")}
      />

      <CheckboxField
        id="rtf-disclaimerAcknowledged"
        label="I have read and understand the Ministry Disclaimer, including that this ministry is not a substitute for professional mental-health care."
        error={errors.disclaimerAcknowledged?.message}
        {...register("disclaimerAcknowledged")}
      />

      <div className="rounded-2xl border border-gold/50 bg-gold/10 px-5 py-4 text-sm leading-relaxed text-forest-dark">
        <strong className="font-semibold">Important:</strong> This ministry
        is not an emergency or crisis service. Anyone experiencing immediate
        danger, a medical emergency, or a mental-health crisis should
        contact local emergency services or an appropriate crisis-support
        provider.
      </div>

      <p className="text-sm text-charcoal-light">
        This is a request only. Submitting this form does not confirm a
        booking — our team will review your application and contact you
        about availability.
      </p>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
