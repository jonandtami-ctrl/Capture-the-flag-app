import { z } from "zod";

export const restoringFoundationsSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
  cityCountry: z.string().trim().min(2, "Please enter your city and country."),
  age: z
    .string()
    .trim()
    .min(1, "Please enter your age.")
    .refine((v) => Number(v) >= 18, "Applicants must be 18 or older."),
  churchAffiliation: z.string().trim().optional(),
  reasonForSeeking: z
    .string()
    .trim()
    .min(20, "Please share a brief description (at least 20 characters)."),
  priorCounsellingOrPrayer: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  currentMentalHealthCare: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  inCrisis: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  hopingToReceive: z
    .string()
    .trim()
    .min(10, "Please share what you're hoping to receive from the sessions."),
  availability: z.string().trim().min(2, "Please share your availability."),
  sessionPreference: z.enum(["online", "in-person", "either"], {
    errorMap: () => ({ message: "Please select a preference." }),
  }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please provide consent to continue." }),
  }),
  privacyAcknowledged: z.literal(true, {
    errorMap: () => ({ message: "Please acknowledge the privacy notice." }),
  }),
  disclaimerAcknowledged: z.literal(true, {
    errorMap: () => ({ message: "Please acknowledge the ministry disclaimer." }),
  }),
});

export type RestoringFoundationsValues = z.infer<
  typeof restoringFoundationsSchema
>;
