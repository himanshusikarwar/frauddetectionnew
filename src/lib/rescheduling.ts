import { addDays, getDay, startOfDay } from "date-fns";

export type RescheduleSlot = {
  topicId: string;
  scheduledDate: Date;
  slotIndex: number;
};

/**
 * Reschedule pending topics from the day after missedDate onward.
 * dayOfWeek: 0 = Sunday, 1 = Monday, ... 6 = Saturday
 */
export function rescheduleFromMissed(options: {
  missedDate: Date;
  studyDayOfWeek: number[];
  topicsPerDay: number;
  pendingTopicIds: string[];
}): RescheduleSlot[] {
  const { missedDate, studyDayOfWeek, topicsPerDay, pendingTopicIds } = options;
  const result: RescheduleSlot[] = [];
  let currentDate = addDays(startOfDay(missedDate), 1);
  let topicIndex = 0;

  while (topicIndex < pendingTopicIds.length) {
    const dayOfWeek = getDay(currentDate);
    if (studyDayOfWeek.includes(dayOfWeek)) {
      for (let s = 0; s < topicsPerDay && topicIndex < pendingTopicIds.length; s++) {
        result.push({
          topicId: pendingTopicIds[topicIndex],
          scheduledDate: new Date(currentDate),
          slotIndex: s,
        });
        topicIndex++;
      }
    }
    currentDate = addDays(currentDate, 1);
  }

  return result;
}
