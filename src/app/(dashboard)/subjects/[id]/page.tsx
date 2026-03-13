import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSubjectById } from "@/app/actions/subjects";
import { format } from "date-fns";
import { SubjectDetailClient } from "./SubjectDetailClient";
import { PdfTopicUpload } from "@/components/schedule/PdfTopicUpload";
import { TopicListWithDelete } from "./TopicListWithDelete";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subject = await getSubjectById(id);
  if (!subject) notFound();

  const completed = subject.topics.filter((t: { status: string }) => t.status === "COMPLETED").length;
  const total = subject.topics.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const nextEntry = subject.scheduleEntries.find(
    (e: { status: string; scheduledDate: Date }) => e.status === "PENDING" && new Date(e.scheduledDate) >= new Date()
  );

  return (
    <>
      <PageHeader
        title={subject.name}
        description={`${subject.topicsPerDay} topic(s) per study day`}
      >
        <div className="flex gap-2">
          <Link href={`/schedule/create`}>
            <Button variant="outline">Add topics</Button>
          </Link>
          <SubjectDetailClient subjectId={subject.id} hasSchedule={subject.scheduleEntries.length > 0} />
        </div>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>
              {completed} of {total} topics completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Study days:{" "}
              {[0, 1, 2, 3, 4, 5, 6]
                .filter((d) => subject.studyDayPreferences.some((p: { dayOfWeek: number }) => p.dayOfWeek === d))
                .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                .join(", ")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next session</CardTitle>
            <CardDescription>
              {nextEntry
                ? format(new Date(nextEntry.scheduledDate), "EEE, MMM d")
                : "No upcoming sessions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextEntry ? (
              <p className="font-medium">{nextEntry.topic.title}</p>
            ) : (
              <p className="text-muted-foreground text-sm">All caught up or no schedule yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>All topics for this subject. You can delete pending topics; calendar and schedule will update.</CardDescription>
        </CardHeader>
        <CardContent>
          {subject.topics.length > 0 ? (
            <TopicListWithDelete topics={subject.topics} subjectId={subject.id} />
          ) : (
            <p className="text-muted-foreground text-sm py-4">No topics yet. Add topics from Create schedule or upload a PDF below.</p>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add topics from PDF</CardTitle>
          <CardDescription>
            Upload a PDF to extract probable topics/headings. Edit the list and save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PdfTopicUpload subjectId={subject.id} />
        </CardContent>
      </Card>
    </>
  );
}
