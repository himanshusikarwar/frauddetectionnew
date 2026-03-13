"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { subjectSchema, type SubjectFormData } from "@/lib/validations/subject";

export async function createSubject(data: SubjectFormData) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const parsed = subjectSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { name, studyDayOfWeek, topicsPerDay, color } = parsed.data;

  const subject = await prisma.subject.create({
    data: {
      userId,
      name,
      color: color ?? null,
      topicsPerDay,
      studyDayPreferences: {
        create: studyDayOfWeek.map((dayOfWeek) => ({ dayOfWeek })),
      },
    },
    include: { studyDayPreferences: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  revalidatePath("/schedule/create");
  revalidatePath("/calendar");
  revalidatePath("/today");
  return { ok: true, subject };
}

export async function updateSubject(
  subjectId: string,
  data: Partial<SubjectFormData>
) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const existing = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!existing) return { ok: false, error: "Subject not found" };

  if (data.studyDayOfWeek !== undefined) {
    await prisma.studyDayPreference.deleteMany({ where: { subjectId } });
    await prisma.studyDayPreference.createMany({
      data: data.studyDayOfWeek.map((dayOfWeek) => ({ subjectId, dayOfWeek })),
    });
  }

  const subject = await prisma.subject.update({
    where: { id: subjectId },
    data: {
      name: data.name,
      topicsPerDay: data.topicsPerDay,
      color: data.color,
    },
    include: { studyDayPreferences: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath("/calendar");
  revalidatePath("/today");
  return { ok: true, subject };
}

export async function deleteSubject(subjectId: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const existing = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!existing) return { ok: false, error: "Subject not found" };

  await prisma.subject.delete({ where: { id: subjectId } });
  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  revalidatePath("/schedule/create");
  revalidatePath("/calendar");
  revalidatePath("/today");
  return { ok: true };
}

export async function getSubjects() {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  return prisma.subject.findMany({
    where: { userId },
    include: {
      studyDayPreferences: true,
      _count: { select: { topics: true } },
      topics: { where: { status: "COMPLETED" } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getSubjectById(subjectId: string) {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  return prisma.subject.findFirst({
    where: { id: subjectId, userId },
    include: {
      studyDayPreferences: true,
      topics: { orderBy: { order: "asc" } },
      scheduleEntries: { include: { topic: true }, orderBy: [{ scheduledDate: "asc" }, { slotIndex: "asc" }] },
    },
  });
}
