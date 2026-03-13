"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markSessionCompleted, markSessionMissed } from "@/app/actions/schedule";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

type Entry = {
  id: string;
  subject: { name: string };
  topic: { title: string };
};

export function TodayCheckIn({ entry }: { entry: Entry }) {
  const [loading, setLoading] = useState<"completed" | "missed" | null>(null);

  const handleCompleted = async () => {
    setLoading("completed");
    const result = await markSessionCompleted(entry.id);
    setLoading(null);
    if (result.ok) {
      toast.success("Marked as completed");
      window.location.reload();
    } else {
      toast.error(result.error ?? "Failed");
    }
  };

  const handleMissed = async () => {
    setLoading("missed");
    const result = await markSessionMissed(entry.id);
    setLoading(null);
    if (result.ok) {
      toast.success("Rescheduled. Remaining topics moved forward.");
      window.location.reload();
    } else {
      toast.error(result.error ?? "Failed");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="font-medium">{entry.subject.name}</p>
        <p className="text-muted-foreground text-sm">{entry.topic.title}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          onClick={handleCompleted}
          disabled={loading !== null}
        >
          {loading === "completed" ? "…" : <Check className="h-4 w-4 mr-1" />}
          Completed
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMissed}
          disabled={loading !== null}
        >
          {loading === "missed" ? "…" : <X className="h-4 w-4 mr-1" />}
          Not studied
        </Button>
      </div>
    </div>
  );
}
