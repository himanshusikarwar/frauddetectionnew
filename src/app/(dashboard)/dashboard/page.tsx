import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Sun, Calendar } from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your study schedule and progress."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s sessions</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data.todayCount > 0 ? (
              <p className="text-2xl font-bold">{data.todayCount}</p>
            ) : (
              <p className="text-muted-foreground text-sm">No sessions today</p>
            )}
            <Link href="/today" className="text-primary text-sm mt-2 inline-block hover:underline">
              View today
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.subjectCount}</p>
            <Link href="/subjects" className="text-primary text-sm mt-2 inline-block hover:underline">
              Manage subjects
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.totalTopics > 0
                ? `${Math.round((data.completedTopics / data.totalTopics) * 100)}%`
                : "—"}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              {data.completedTopics} / {data.totalTopics} topics
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Create a new schedule or view your calendar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/schedule/create">
              <Button>Create study schedule</Button>
            </Link>
            <Link href="/calendar">
              <Button variant="outline">Open calendar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
