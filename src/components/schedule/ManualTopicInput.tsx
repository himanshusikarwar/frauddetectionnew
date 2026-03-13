"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTopic, deleteTopic } from "@/app/actions/topics";
import { getSubjectById } from "@/app/actions/subjects";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ManualTopicInputProps = {
  subjectId: string;
  onCountChange: (n: number) => void;
  onAdded?: () => void;
};

export function ManualTopicInput({ subjectId, onCountChange, onAdded }: ManualTopicInputProps) {
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState<{ id: string; title: string; order: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getSubjectById(subjectId).then((sub) => {
      if (sub?.topics) setTopics(sub.topics.map((t: { id: string; title: string; order: number }) => ({ id: t.id, title: t.title, order: t.order })));
      setFetching(false);
    });
  }, [subjectId]);

  useEffect(() => {
    onCountChange(topics.length);
  }, [topics.length, onCountChange]);

  const handleAdd = async () => {
    const t = title.trim();
    if (!t) return;
    setLoading(true);
    const result = await addTopic(subjectId, t);
    setLoading(false);
    if (result.ok && result.topic) {
      setTopics((prev) => [...prev, { id: result.topic!.id, title: result.topic!.title, order: prev.length }]);
      setTitle("");
      onAdded?.();
      toast.success("Topic added");
    } else {
      toast.error("Failed to add topic");
    }
  };

  const handleDelete = async (topicId: string) => {
    const result = await deleteTopic(topicId);
    if (result.ok) {
      setTopics((prev) => prev.filter((x) => x.id !== topicId));
      toast.success("Topic removed");
    } else {
      toast.error("Failed to remove");
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Topic name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
        />
        <Button onClick={handleAdd} disabled={loading || !title.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </div>
      <ul className="space-y-2 max-h-60 overflow-auto">
        {topics.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <span>{t.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(t.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      {topics.length === 0 && (
        <p className="text-sm text-muted-foreground">No topics yet. Add one above.</p>
      )}
    </div>
  );
}
