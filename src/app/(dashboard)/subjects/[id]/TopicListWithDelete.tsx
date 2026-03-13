"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteTopic } from "@/app/actions/topics";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmModal } from "@/components/dashboard/ConfirmModal";

type TopicItem = { id: string; title: string; status: string };

export function TopicListWithDelete({
  topics,
  subjectId,
}: {
  topics: TopicItem[];
  subjectId: string;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTopic, setConfirmTopic] = useState<TopicItem | null>(null);

  const handleDelete = async (topic: TopicItem) => {
    if (topic.status === "COMPLETED") {
      toast.error("Completed topics cannot be deleted.");
      return;
    }
    setConfirmTopic(topic);
  };

  const doDelete = async () => {
    if (!confirmTopic) return;
    setDeletingId(confirmTopic.id);
    const result = await deleteTopic(confirmTopic.id);
    setDeletingId(null);
    setConfirmTopic(null);
    if (result.ok) {
      toast.success("Topic deleted. Calendar updated.");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete");
    }
  };

  return (
    <>
      <ul className="space-y-2">
        {topics.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <span className={t.status === "COMPLETED" ? "text-muted-foreground line-through" : ""}>
              {t.title}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={t.status === "COMPLETED" ? "success" : "secondary"}>
                {t.status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDelete(t)}
                disabled={t.status === "COMPLETED" || deletingId === t.id}
                title={t.status === "COMPLETED" ? "Completed topics cannot be deleted" : "Delete topic"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmModal
        open={!!confirmTopic}
        onOpenChange={(open) => !open && setConfirmTopic(null)}
        title="Delete topic?"
        description={
          confirmTopic
            ? `"${confirmTopic.title}" will be removed from this subject and from the schedule. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={doDelete}
        loading={deletingId !== null}
      />
    </>
  );
}
