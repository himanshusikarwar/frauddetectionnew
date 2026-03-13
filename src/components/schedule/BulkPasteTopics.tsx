"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addTopicsBulk } from "@/app/actions/topics";
import { getSubjectById } from "@/app/actions/subjects";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function parsePaste(text: string): string[] {
  const lines = text
    .split(/\n/)
    .map((line) => line.replace(/^[\s\-*•·]\s*|\s*$/g, "").replace(/^\d+\.\s*/, ""))
    .map((line) => line.split(",").map((s) => s.trim()))
    .flat()
    .filter((s) => s.length > 0);
  return [...new Set(lines)];
}

type BulkPasteTopicsProps = {
  subjectId: string;
  onCountChange: (n: number) => void;
  onAdded?: () => void;
};

export function BulkPasteTopics({ subjectId, onCountChange, onAdded }: BulkPasteTopicsProps) {
  const [paste, setPaste] = useState("");
  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const parsed = parsePaste(paste);
    setPreview(parsed.slice(0, 20));
  }, [paste]);

  useEffect(() => {
    getSubjectById(subjectId).then((sub) => {
      if (sub?.topics) onCountChange(sub.topics.length);
    });
  }, [subjectId, onCountChange]);

  const handleSave = async () => {
    const topics = parsePaste(paste);
    if (topics.length === 0) {
      toast.error("No valid topics to add");
      return;
    }
    setLoading(true);
    const result = await addTopicsBulk(subjectId, topics);
    setLoading(false);
    if (result.ok) {
      setPaste("");
      onAdded?.();
      toast.success(`Added ${topics.length} topics`);
    } else {
      toast.error("Failed to add topics");
    }
  };

  const parsed = parsePaste(paste);
  const hasMore = parsed.length > 20;

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste one topic per line, or comma-separated. Bullets and numbers are stripped."
        className="min-h-[120px]"
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
      />
      {preview.length > 0 && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <p className="font-medium mb-2">Preview ({parsed.length} topics):</p>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            {preview.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
            {hasMore && <li>… and {parsed.length - 20} more</li>}
          </ul>
        </div>
      )}
      <Button onClick={handleSave} disabled={loading || parsed.length === 0}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Add {parsed.length > 0 ? parsed.length : ""} topics
      </Button>
    </div>
  );
}
