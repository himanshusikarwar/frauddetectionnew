"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateScheduleForSubject } from "@/app/actions/schedule";
import { format } from "date-fns";
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

type GenerateScheduleStepProps = {
  subjectId: string;
  subjectName: string;
  onBack: () => void;
  onDone: () => void;
};

export function GenerateScheduleStep({
  subjectId,
  subjectName,
  onBack,
  onDone,
}: GenerateScheduleStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateScheduleForSubject(subjectId, new Date(startDate));
    setLoading(false);
    if (result.ok) {
      toast.success("Schedule generated. Calendar updated.");
      router.refresh();
      onDone();
    } else {
      toast.error(result.error ?? "Failed to generate schedule");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate schedule: {subjectName}</CardTitle>
          <CardDescription>
            Choose a start date. Topics will be assigned to your selected study days from this date. Your calendar and Today view will update after generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start date</label>
            <input
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating…
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Generate schedule
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="outline" onClick={onDone}>
          Done (skip generation)
        </Button>
      </div>
    </div>
  );
}
