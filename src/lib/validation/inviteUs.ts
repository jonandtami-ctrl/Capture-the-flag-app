import { z } from "zod";

export const inviteUsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  organization: z.string().trim().min(2, "Please enter your organization or church."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(7, "Please enter a valid phone number."),
  cityLocation: z.string().trim().min(2, "Please enter the city and location."),
  website: z.string().trim().optional().or(z.literal("")),
  eventName: z.string().trim().min(2, "Please enter the event name."),
  proposedDates: z.string().trim().min(2, "Please share proposed dates."),
  estimatedAttendance: z.string().trim().min(1, "Please enter estimated attendance."),
  audienceAgeRange: z.string().trim().min(1, "Please enter the audience age range."),
  requestedTopics: z
    .string()
    .trim()
    .min(5, "Please share the topics you'd like covered."),
  eventFormat: z.string().trim().min(2, "Please describe the event format."),
  numberOfSessions: z.string().trim().min(1, "Please enter the number of sessions."),
  travelAccommodation: z.string().trim().optional(),
  honorarium: z.string().trim().optional(),
  additionalDetails: z.string().trim().optional(),
});

export type InviteUsValues = z.infer<typeof inviteUsSchema>;
