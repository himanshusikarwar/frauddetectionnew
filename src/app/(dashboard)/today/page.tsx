import { startOfDay, endOfDay } from "date-fns";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { TodayCheckIn } from "@/components/today/TodayCheckIn";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const session = await getSession();
  const userId = session?.userId ?? "demo-user-1";

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      subject: { userId },
      status: "PENDING",
      scheduledDate: { lte: todayEnd },
    },
    include: { subject: true, topic: true },
    orderBy: [{ scheduledDate: "asc" }, { subject: { name: "asc" } }, { slotIndex: "asc" }],
  });

  const pastDueEntries = entries.filter(
    (e: { scheduledDate: Date }) => new Date(e.scheduledDate) < todayStart
  );
  const todayEntries = entries.filter(
    (e: { scheduledDate: Date }) => new Date(e.scheduledDate) >= todayStart
  );

  return (
    <>
      <PageHeader
        title="Today"
        description="Mark your study sessions as completed or not studied."
      />
      {entries.length === 0 ? (
        <EmptyState
          title="No sessions today"
          description="You have no study sessions scheduled for today. Check your calendar for upcoming sessions."
          action={{ label: "View calendar", href: "/calendar" }}
        />
      ) : (
        <div className="space-y-6 max-w-2xl">
          {pastDueEntries.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Past due
              </h2>
              <div className="space-y-4">
                {pastDueEntries.map(
                  (entry: {
                    id: string;
                    subject: { name: string };
                    topic: { title: string };
                    scheduledDate: Date;
                  }) => (
                    <Card key={entry.id}>
                      <CardContent className="p-6">
                        <TodayCheckIn entry={entry} />
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}
          {todayEntries.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Today
              </h2>
              <div className="space-y-4">
                {todayEntries.map(
                  (entry: {
                    id: string;
                    subject: { name: string };
                    topic: { title: string };
                  }) => (
                    <Card key={entry.id}>
                      <CardContent className="p-6">
                        <TodayCheckIn entry={entry} />
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
