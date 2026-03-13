"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractTopicsFromText } from "@/lib/pdf-extract";

export async function extractTopicsFromPdf(formData: FormData): Promise<
  | { ok: true; topics: string[] }
  | { ok: false; error: string }
> {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const file = formData.get("file") as File | null;
  if (!file || file.type !== "application/pdf") {
    return { ok: false, error: "Please upload a PDF file." };
  }

  let text: string;
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    text = data.text ?? "";
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to read PDF. Try adding topics manually or paste text." };
  }

  const topics = extractTopicsFromText(text);
  if (topics.length === 0) {
    return { ok: false, error: "No topics could be extracted. Try adding topics manually or paste a list." };
  }

  return { ok: true, topics };
}

export async function saveExtractedTopics(
  subjectId: string,
  topics: string[]
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });
  if (!subject) return { ok: false, error: "Subject not found" };

  const maxOrder = await prisma.topic
    .findFirst({ where: { subjectId }, orderBy: { order: "desc" }, select: { order: true } })
    .then((t: { order: number } | null) => t?.order ?? -1);

  await prisma.$transaction(
    topics.map((title, i) =>
      prisma.topic.create({
        data: { subjectId, title: title.trim(), order: maxOrder + 1 + i },
      })
    )
  );

  return { ok: true };
}
