"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractTopicsFromPdf, saveExtractedTopics } from "@/app/actions/pdf";
import { Loader2, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type PdfTopicUploadProps = {
  subjectId: string;
  onSaved?: () => void;
};

export function PdfTopicUpload({ subjectId, onSaved }: PdfTopicUploadProps) {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await extractTopicsFromPdf(formData);
    setLoading(false);
    if (result.ok) {
      setTopics(result.topics);
      toast.success(`Extracted ${result.topics.length} topics`);
    } else {
      toast.error(result.error);
    }
    e.target.value = "";
  };

  const addTopic = () => setTopics((prev) => [...prev, ""]);
  const updateTopic = (i: number, value: string) => {
    setTopics((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };
  const removeTopic = (i: number) => setTopics((prev) => prev.filter((_, j) => j !== i));

  const handleSave = async () => {
    const toSave = topics.filter((t) => t.trim().length > 0);
    if (toSave.length === 0) {
      toast.error("Add at least one topic");
      return;
    }
    setSaving(true);
    const result = await saveExtractedTopics(subjectId, toSave);
    setSaving(false);
    if (result.ok) {
      toast.success(`Saved ${toSave.length} topics`);
      setTopics([]);
      onSaved?.();
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload PDF
        </Button>
        {topics.length > 0 && (
          <Button variant="outline" size="sm" onClick={addTopic}>
            <Plus className="h-4 w-4 mr-1" />
            Add row
          </Button>
        )}
      </div>
      {topics.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-auto rounded-md border p-3">
          <p className="text-sm text-muted-foreground">Edit the list below, then save.</p>
          {topics.map((t, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={t}
                onChange={(e) => updateTopic(i, e.target.value)}
                placeholder="Topic title"
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive"
                onClick={() => removeTopic(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : `Save ${topics.filter((x) => x.trim()).length} topics`}
          </Button>
        </div>
      )}
    </div>
  );
}
