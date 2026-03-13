"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSubjects } from "@/app/actions/subjects";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SubjectForm } from "@/components/schedule/SubjectForm";
import { TopicInputStep } from "@/components/schedule/TopicInputStep";
import { GenerateScheduleStep } from "@/components/schedule/GenerateScheduleStep";
import { Loader2 } from "lucide-react";

type Step = "subject" | "topics" | "generate";

export default function CreateSchedulePage() {
  const [step, setStep] = useState<Step>("subject");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  type SubjectItem = Awaited<ReturnType<typeof getSubjects>>[number];
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects().then(setSubjects).finally(() => setLoading(false));
  }, []);

  const currentSubject = subjects.find((s) => s.id === subjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Create study schedule"
        description="Add a subject, choose study days and topics per day, then add topics and generate your schedule."
      />
      <div className="max-w-2xl space-y-6">
        {step === "subject" && (
          <SubjectForm
            subjects={subjects}
            onSubjectCreated={(id) => {
              setSubjectId(id);
              setStep("topics");
              getSubjects().then(setSubjects);
            }}
            onSelectExisting={(id) => {
              setSubjectId(id);
              setStep("topics");
            }}
          />
        )}
        {step === "topics" && subjectId && currentSubject && (
          <TopicInputStep
            subjectId={subjectId}
            subjectName={currentSubject.name}
            topicsPerDay={currentSubject.topicsPerDay}
            onBack={() => setStep("subject")}
            onDone={() => {
              setStep("generate");
              getSubjects().then(setSubjects);
            }}
          />
        )}
        {step === "generate" && subjectId && currentSubject && (
          <GenerateScheduleStep
            subjectId={subjectId}
            subjectName={currentSubject.name}
            onBack={() => setStep("topics")}
            onDone={() => {
              setSubjectId(null);
              setStep("subject");
              getSubjects().then(setSubjects);
            }}
          />
        )}
      </div>
    </>
  );
}
