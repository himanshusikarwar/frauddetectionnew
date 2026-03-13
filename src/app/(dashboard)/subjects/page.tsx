import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getSubjects } from "@/app/actions/subjects";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Manage your subjects and view progress."
      >
        <Link href="/schedule/create">
          <Button>Create schedule</Button>
        </Link>
      </PageHeader>
      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Create a study schedule to add subjects, set study days, and add topics."
          action={{ label: "Create study schedule", href: "/schedule/create" }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s: { id: string; name: string; color: string | null; topics: unknown[]; _count: { topics: number } }) => {
            const completed = s.topics.length;
            const total = s._count.topics;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <Link key={s.id} href={`/subjects/${s.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{s.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {completed} / {total} topics completed
                        </p>
                      </div>
                      {s.color && (
                        <span
                          className="w-3 h-3 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: s.color }}
                        />
                      )}
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
