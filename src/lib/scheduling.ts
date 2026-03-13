import { addDays, getDay, startOfDay } from "date-fns";

export type ScheduleSlot = {
  topicId: string;
  scheduledDate: Date;
  slotIndex: number;
};

/**
 * dayOfWeek: 0 = Sunday, 1 = Monday, ... 6 = Saturday (JavaScript getDay())
 */
export function generateSchedule(options: {
  startDate: Date;
  studyDayOfWeek: number[];
  topics: { id: string; order: number }[];
  topicsPerDay: number;
}): ScheduleSlot[] {
  const { startDate, studyDayOfWeek, topics, topicsPerDay } = options;
  const sorted = [...topics].sort((a, b) => a.order - b.order);
  const result: ScheduleSlot[] = [];
  let currentDate = startOfDay(startDate);
  let topicIndex = 0;
  let slotIndex = 0;

  while (topicIndex < sorted.length) {
    const dayOfWeek = getDay(currentDate);
    if (studyDayOfWeek.includes(dayOfWeek)) {
      for (let s = 0; s < topicsPerDay && topicIndex < sorted.length; s++) {
        result.push({
          topicId: sorted[topicIndex].id,
          scheduledDate: new Date(currentDate),
          slotIndex: s,
        });
        topicIndex++;
      }
      slotIndex = 0;
    }
    currentDate = addDays(currentDate, 1);
  }

  return result;
}
