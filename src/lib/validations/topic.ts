import { z } from "zod";

export const topicSchema = z.object({
  title: z.string().min(1, "Topic title is required").max(500),
  order: z.number().int().min(0),
});

export const bulkTopicsSchema = z.object({
  subjectId: z.string().cuid(),
  topics: z.array(z.object({ title: z.string().min(1).max(500) })),
});
