import { z } from "zod";

// Use simple types compatible with react-hook-form + @hookform/resolvers/zod@5 + zod@4
export const ContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // Optional string fields: empty string is allowed, validated as needed
  email: z
    .string()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Invalid email",
    }),
  phone: z.string(),
  workTitle: z.string(),
  company: z.string(),
  warmth: z.number().int().min(0).max(10),
  notes: z.string(),
  lastInteraction: z.string(),
  birthday: z.string(),
  linkedinUrl: z.string(),
  groupIds: z.array(z.string()),
});

export type ContactFormValues = z.infer<typeof ContactSchema>;

export const GroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

export type GroupFormValues = z.infer<typeof GroupSchema>;
