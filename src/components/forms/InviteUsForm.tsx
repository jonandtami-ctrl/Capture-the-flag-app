"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteUsSchema, type InviteUsValues } from "@/lib/validation/inviteUs";
import {
  TextField,
  TextareaField,
  FormAlert,
} from "@/components/forms/FormElements";

export default function InviteUsForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteUsValues>({
    resolver: zodResolver(inviteUsSchema),
  });

  const onSubmit = async (values: InviteUsValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/invite", {
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
        <label htmlFor="honeypot-invite">Leave this field empty</label>
        <input
          id="honeypot-invite"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          ref={honeypotRef}
        />
      </div>

      {status === "success" && (
        <FormAlert variant="success">
          Thank you for your invitation. Our team will prayerfully review
          your request and contact you regarding availability and next
          steps.
        </FormAlert>
      )}
      {status === "error" && (
        <FormAlert variant="error">
          Something went wrong submitting your invitation. Please try again,
          or reach out to us directly via the Contact page.
        </FormAlert>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="invite-name"
          label="Name"
          required
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          id="invite-organization"
          label="Organization or church"
          required
          error={errors.organization?.message}
          {...register("organization")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="invite-email"
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          id="invite-phone"
          label="Phone number"
          type="tel"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="invite-cityLocation"
          label="City and location"
          required
          error={errors.cityLocation?.message}
          {...register("cityLocation")}
        />
        <TextField
          id="invite-website"
          label="Website"
          hint="Optional"
          error={errors.website?.message}
          {...register("website")}
        />
      </div>

      <TextField
        id="invite-eventName"
        label="Event name"
        required
        error={errors.eventName?.message}
        {...register("eventName")}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="invite-proposedDates"
          label="Proposed dates"
          required
          error={errors.proposedDates?.message}
          {...register("proposedDates")}
        />
        <TextField
          id="invite-estimatedAttendance"
          label="Estimated attendance"
          required
          error={errors.estimatedAttendance?.message}
          {...register("estimatedAttendance")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="invite-audienceAgeRange"
          label="Audience age range"
          required
          error={errors.audienceAgeRange?.message}
          {...register("audienceAgeRange")}
        />
        <TextField
          id="invite-numberOfSessions"
          label="Number of sessions"
          required
          error={errors.numberOfSessions?.message}
          {...register("numberOfSessions")}
        />
      </div>

      <TextareaField
        id="invite-requestedTopics"
        label="Requested teaching topics"
        required
        error={errors.requestedTopics?.message}
        {...register("requestedTopics")}
      />

      <TextField
        id="invite-eventFormat"
        label="Event format"
        hint="E.g. weekend conference, single service, multi-session training"
        required
        error={errors.eventFormat?.message}
        {...register("eventFormat")}
      />

      <TextareaField
        id="invite-travelAccommodation"
        label="Travel and accommodation information"
        hint="Optional"
        error={errors.travelAccommodation?.message}
        {...register("travelAccommodation")}
      />

      <TextField
        id="invite-honorarium"
        label="Speaker budget or honorarium"
        hint="Optional"
        error={errors.honorarium?.message}
        {...register("honorarium")}
      />

      <TextareaField
        id="invite-additionalDetails"
        label="Additional details"
        hint="Optional"
        error={errors.additionalDetails?.message}
        {...register("additionalDetails")}
      />

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Submit Invitation"}
      </button>
    </form>
  );
}
