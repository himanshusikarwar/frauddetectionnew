import { PrismaClient } from "@prisma/client";
import { startOfDay, addDays, getDay } from "date-fns";

const prisma = new PrismaClient();

function generateScheduleSeed(
  startDate: Date,
  studyDayOfWeek: number[],
  topicIds: string[],
  topicsPerDay: number
): { topicId: string; scheduledDate: Date; slotIndex: number }[] {
  const result: { topicId: string; scheduledDate: Date; slotIndex: number }[] = [];
  let currentDate = startOfDay(startDate);
  let topicIndex = 0;
  while (topicIndex < topicIds.length) {
    const dayOfWeek = getDay(currentDate);
    if (studyDayOfWeek.includes(dayOfWeek)) {
      for (let s = 0; s < topicsPerDay && topicIndex < topicIds.length; s++) {
        result.push({
          topicId: topicIds[topicIndex],
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

const DEMO_USER_ID = "demo-user-1";

async function main() {
  let user = await prisma.user.findUnique({ where: { demoId: DEMO_USER_ID } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        demoId: DEMO_USER_ID,
        name: "Demo Student",
        email: "demo@study.local",
      },
    });
  }

  let physics = await prisma.subject.findFirst({
    where: { userId: user.id, name: "Physics" },
  });
  if (!physics) {
    physics = await prisma.subject.create({
      data: {
        userId: user.id,
        name: "Physics",
        color: "#8B5CF6",
        topicsPerDay: 1,
        scheduleStartDate: startOfDay(new Date()),
      },
    });
    for (const day of [1, 3, 5]) {
      await prisma.studyDayPreference.create({
        data: { subjectId: physics.id, dayOfWeek: day },
      });
    }
    const topicNames = ["Motion", "Force", "Work", "Energy"];
    const topicIds: string[] = [];
    for (let i = 0; i < topicNames.length; i++) {
      const topic = await prisma.topic.create({
        data: {
          subjectId: physics.id,
          title: topicNames[i],
          order: i,
          status: i === 0 ? "COMPLETED" : "PENDING",
        },
      });
      topicIds.push(topic.id);
    }
    const slots = generateScheduleSeed(
      startOfDay(new Date()),
      [1, 3, 5],
      topicIds,
      1
    );
    const firstTopicId = topicIds[0];
    for (const slot of slots) {
      await prisma.scheduleEntry.create({
        data: {
          subjectId: physics.id,
          topicId: slot.topicId,
          scheduledDate: slot.scheduledDate,
          slotIndex: slot.slotIndex,
          status: slot.topicId === firstTopicId ? "COMPLETED" : "PENDING",
        },
      });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
