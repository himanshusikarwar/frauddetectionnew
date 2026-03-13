import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
import { SchedulePdfDownload } from "@/components/calendar/SchedulePdfDownload";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
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
  });

  return (
    <>
      <PageHeader
        title="Calendar"
        description="View your scheduled study sessions by date. Generate a schedule (Create schedule → pick subject, add topics → Generate schedule) to see sessions here."
      >
        <SchedulePdfDownload />
      </PageHeader>
      <CalendarView entries={entries} />
    </>
  );
}
