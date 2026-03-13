"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subjectSchema, type SubjectFormData } from "@/lib/validations/subject";
import { createSubject } from "@/app/actions/subjects";
import { toast } from "sonner";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

type SubjectFormProps = {
  subjects: Awaited<ReturnType<typeof import("@/app/actions/subjects").getSubjects>>;
  onSubjectCreated: (subjectId: string) => void;
  onSelectExisting: (subjectId: string) => void;
};

export function SubjectForm({
  subjects,
  onSubjectCreated,
  onSelectExisting,
}: SubjectFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      studyDayOfWeek: [],
      topicsPerDay: 1,
    },
  });

  const onSubmit = async (data: SubjectFormData) => {
    setLoading(true);
    const result = await createSubject(data);
    setLoading(false);
    if (result.ok && result.subject) {
      toast.success("Subject created");
      onSubjectCreated(result.subject.id);
    } else {
      const err = result && "error" in result ? result.error : null;
      toast.error(Array.isArray(err?.studyDayOfWeek) ? "Select at least one study day" : "Failed to create subject");
    }
  };

  return (
    <div className="space-y-6">
      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Or use existing subject</CardTitle>
            <CardDescription>Select a subject to add topics and generate schedule.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {subjects.map((s: { id: string; name: string }) => (
              <Button
                key={s.id}
                variant="outline"
                size="sm"
                onClick={() => onSelectExisting(s.id)}
              >
                {s.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Add new subject</CardTitle>
          <CardDescription>
            On what days do you want to study this subject? How many topics per study day?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Subject name</Label>
              <Input
                id="name"
                placeholder="e.g. Physics"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Study days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <label key={d.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-input"
                      checked={form.watch("studyDayOfWeek").includes(d.value)}
                      onChange={(e) => {
                        const current = form.getValues("studyDayOfWeek");
                        if (e.target.checked) {
                          form.setValue("studyDayOfWeek", [...current, d.value].sort((a, b) => a - b));
                        } else {
                          form.setValue(
                            "studyDayOfWeek",
                            current.filter((x) => x !== d.value)
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{d.label}</span>
                  </label>
                ))}
              </div>
              {form.formState.errors.studyDayOfWeek && (
                <p className="text-sm text-destructive">Select at least one study day</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="topicsPerDay">Topics per study day</Label>
              <Input
                id="topicsPerDay"
                type="number"
                min={1}
                max={10}
                {...form.register("topicsPerDay", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                How many topics do you want to cover on each study day for this subject?
              </p>
              {form.formState.errors.topicsPerDay && (
                <p className="text-sm text-destructive">{form.formState.errors.topicsPerDay.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Add subject & continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
