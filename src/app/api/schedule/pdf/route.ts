import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, addMonths, format } from "date-fns";
import { jsPDF } from "jspdf";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(addMonths(now, 11));

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      subject: { userId },
      scheduledDate: { gte: start, lte: end },
    },
    include: { subject: true, topic: true },
    orderBy: { scheduledDate: "asc" },
  });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.getPageWidth();
  const margin = 14;
  let y = 20;

  doc.setFontSize(18);
  doc.text("Study Schedule", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "PPP")}`, margin, y);
  doc.text(`Sessions: ${entries.length}`, margin + 80, y);
  y += 12;

  const colWidths = [28, 45, 75, 28];
  const headers = ["Date", "Subject", "Topic", "Status"];
  const rowHeight = 8;

  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  headers.forEach((h, i) => {
    const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(h, x + 2, y - 2);
  });
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += rowHeight;
  doc.setFont(undefined, "normal");

  entries.forEach((entry) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const dateStr = format(new Date(entry.scheduledDate), "dd MMM yyyy");
    const subject = entry.subject.name;
    const topic = entry.topic.title;
    const status = entry.status;

    const row = [dateStr, subject, topic.length > 40 ? topic.slice(0, 39) + "…" : topic, status];
    row.forEach((cell, i) => {
      const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(cell, x + 2, y - 2);
    });
    doc.line(margin, y, pageWidth - margin, y);
    y += rowHeight;
  });

  const filename = `study-schedule-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  const blob = doc.output("blob");
  const buffer = await blob.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
