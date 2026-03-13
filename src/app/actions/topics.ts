"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function addTopic(subjectId: string, title: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!subject) return { ok: false, error: "Subject not found" };

  const maxOrder = await prisma.topic
    .findFirst({ where: { subjectId }, orderBy: { order: "desc" }, select: { order: true } })
    .then((t: { order: number } | null) => t?.order ?? -1);

  const topic = await prisma.topic.create({
    data: { subjectId, title: title.trim(), order: maxOrder + 1 },
  });

  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath("/schedule/create");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/today");
  return { ok: true, topic };
}

export async function addTopicsBulk(subjectId: string, titles: string[]) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!subject) return { ok: false, error: "Subject not found" };

  const maxOrder = await prisma.topic
    .findFirst({ where: { subjectId }, orderBy: { order: "desc" }, select: { order: true } })
    .then((t: { order: number } | null) => t?.order ?? -1);

  const created = await prisma.$transaction(
    titles.map((title, i) =>
      prisma.topic.create({
        data: { subjectId, title: title.trim(), order: maxOrder + 1 + i },
      })
    )
  );

  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath("/schedule/create");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/today");
  return { ok: true, topics: created };
}

export async function updateTopicOrder(subjectId: string, topicIds: string[]) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!subject) return { ok: false, error: "Subject not found" };

  await prisma.$transaction(
    topicIds.map((id, order) =>
      prisma.topic.update({ where: { id }, data: { order } })
    )
  );

  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath("/schedule/create");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/today");
  return { ok: true };
}

export async function deleteTopic(topicId: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { subject: true },
  });
  if (!topic || topic.subject.userId !== userId) return { ok: false, error: "Topic not found" };

  await prisma.scheduleEntry.deleteMany({ where: { topicId } });
  await prisma.topic.delete({ where: { id: topicId } });

  revalidatePath(`/subjects/${topic.subjectId}`);
  revalidatePath("/schedule/create");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/today");
  return { ok: true };
}

export async function updateTopicTitle(topicId: string, title: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const topic = await prisma.topic.findFirst({
    where: { id: topicId },
    include: { subject: true },
  });
  if (!topic || topic.subject.userId !== userId) return { ok: false, error: "Topic not found" };

  await prisma.topic.update({ where: { id: topicId }, data: { title: title.trim() } });
  revalidatePath(`/subjects/${topic.subjectId}`);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/today");
  return { ok: true };
}
