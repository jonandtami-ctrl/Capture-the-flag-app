import { z } from "zod";

export const propheticSessionSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
  cityCountry: z.string().trim().min(2, "Please enter your city and country."),
  ageConfirmation: z.literal(true, {
    errorMap: () => ({ message: "You must confirm you are 18 or older." }),
  }),
  churchAffiliation: z.string().trim().optional(),
  reasonForRequest: z
    .string()
    .trim()
    .min(20, "Please share a little more about what you are seeking (at least 20 characters)."),
  hasReceivedPropheticMinistry: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  comfortableWithVideo: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select an option." }),
  }),
  availability: z.string().trim().min(2, "Please share your preferred dates or availability."),
  prayerRequests: z.string().trim().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please provide consent to continue." }),
  }),
  disclaimerAcknowledged: z.literal(true, {
    errorMap: () => ({ message: "Please acknowledge the ministry disclaimer." }),
  }),
});

export type PropheticSessionValues = z.infer<typeof propheticSessionSchema>;
