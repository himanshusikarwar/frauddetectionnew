import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(200),
  studyDayOfWeek: z.array(z.number().min(0).max(6)).min(1, "Select at least one study day"),
  topicsPerDay: z.number().int().min(1).max(10).default(1),
  color: z.string().optional(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
