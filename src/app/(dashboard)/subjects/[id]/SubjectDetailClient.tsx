"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteSubject } from "@/app/actions/subjects";
import { clearScheduleForSubject } from "@/app/actions/schedule";
import { toast } from "sonner";
import { CalendarX } from "lucide-react";

export function SubjectDetailClient({
  subjectId,
  hasSchedule,
}: {
  subjectId: string;
  hasSchedule: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteSubject(subjectId);
    setLoading(false);
    if (result.ok) {
      toast.success("Subject deleted");
      router.push("/subjects");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
    setOpen(false);
  };

  const handleRemoveSchedule = async () => {
    setScheduleLoading(true);
    const result = await clearScheduleForSubject(subjectId);
    setScheduleLoading(false);
    if (result.ok) {
      toast.success("Schedule removed. Subject and topics kept. You can generate a new schedule anytime.");
      setScheduleOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to remove schedule");
    }
  };

  return (
    <>
      {hasSchedule && (
        <Button
          variant="outline"
          onClick={() => setScheduleOpen(true)}
          className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950"
        >
          <CalendarX className="h-4 w-4 mr-2" />
          Remove schedule
        </Button>
      )}
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete subject
      </Button>
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove schedule?</DialogTitle>
            <DialogDescription>
              This will clear all scheduled dates for this subject from the calendar. Your subject and all topics will stay. You can generate a new schedule anytime from Create schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)} disabled={scheduleLoading}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveSchedule}
              disabled={scheduleLoading}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              {scheduleLoading ? "Removing…" : "Remove schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete subject?</DialogTitle>
            <DialogDescription>
              This will remove the subject and all its topics and schedule. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
