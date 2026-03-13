"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Entry = {
  id: string;
  scheduledDate: Date;
  status: string;
  subject: { name: string; color: string | null };
  topic: { title: string };
};

export function CalendarView({
  entries,
}: {
  entries: Entry[];
}) {
  const [month, setMonth] = useState(new Date());

  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  const padStart = start.getDay();
  const padEnd = 6 - end.getDay();
  const cells: (Date | null)[] = [
    ...Array(padStart).fill(null),
    ...days,
    ...Array(padEnd).fill(null),
  ];

  const getEntriesForDate = (date: Date) =>
    entries.filter(
      (e) =>
        isSameDay(new Date(e.scheduledDate), date)
    );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold text-lg">{format(month, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            const isPadding = date === null;
            const dayEntries = date ? getEntriesForDate(date) : [];
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[80px] rounded-md border p-2 text-sm",
                  isPadding && "opacity-40",
                  date && isSameDay(date, new Date()) && "ring-2 ring-primary"
                )}
              >
                {date && (
                  <>
                    <div className="font-medium mb-1">{format(date, "d")}</div>
                    <ul className="space-y-0.5">
                      {dayEntries.slice(0, 3).map((e) => (
                        <li
                          key={e.id}
                          className={cn(
                            "truncate rounded px-1 text-xs",
                            e.status === "COMPLETED" && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
                            e.status === "MISSED" && "bg-amber-500/20 text-amber-700 dark:text-amber-400",
                            e.status === "PENDING" && "bg-primary/10 text-primary"
                          )}
                          title={`${e.subject.name}: ${e.topic.title}`}
                        >
                          {e.subject.name}: {e.topic.title}
                        </li>
                      ))}
                      {dayEntries.length > 3 && (
                        <li className="text-muted-foreground text-xs">+{dayEntries.length - 3}</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
