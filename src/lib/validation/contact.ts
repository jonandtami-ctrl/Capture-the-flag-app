import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  subject: z.string().trim().min(2, "Please enter a subject."),
  message: z.string().trim().min(10, "Please enter a message (at least 10 characters)."),
});

export type ContactValues = z.infer<typeof contactSchema>;
