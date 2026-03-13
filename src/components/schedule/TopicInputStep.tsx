"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualTopicInput } from "./ManualTopicInput";
import { BulkPasteTopics } from "./BulkPasteTopics";
import { getSubjectById } from "@/app/actions/subjects";
import { FileText } from "lucide-react";

type TopicInputStepProps = {
  subjectId: string;
  subjectName: string;
  topicsPerDay: number;
  onBack: () => void;
  onDone: () => void;
};

export function TopicInputStep({
  subjectId,
  subjectName,
  topicsPerDay,
  onBack,
  onDone,
}: TopicInputStepProps) {
  const [topicCount, setTopicCount] = useState(0);

  const refreshCount = useCallback(() => {
    getSubjectById(subjectId).then((sub) => {
      if (sub?.topics) setTopicCount(sub.topics.length);
    });
  }, [subjectId]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add topics: {subjectName}</CardTitle>
          <CardDescription>
            One topic will be assigned to one study day (up to {topicsPerDay} topic{topicsPerDay > 1 ? "s" : ""} per day).
            Add topics manually, paste a list, or upload a PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="paste">Paste list</TabsTrigger>
              <TabsTrigger value="pdf">PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="mt-4">
              <ManualTopicInput
                subjectId={subjectId}
                onCountChange={setTopicCount}
                onAdded={refreshCount}
              />
            </TabsContent>
            <TabsContent value="paste" className="mt-4">
              <BulkPasteTopics
                subjectId={subjectId}
                onCountChange={setTopicCount}
                onAdded={refreshCount}
              />
            </TabsContent>
            <TabsContent value="pdf" className="mt-4">
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-2" />
                <p>PDF upload: use the PDF tab on the subject page to extract topics from a PDF.</p>
                <p className="text-sm mt-1">You can add topics here with Manual or Paste, then generate schedule.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onDone} disabled={topicCount === 0}>
          Continue to generate schedule
        </Button>
      </div>
    </div>
  );
}
