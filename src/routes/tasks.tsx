import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PriorityBadge } from "@/components/AiStates";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHistory, useTasks, type Task } from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks | AI Productivity Assistant" },
      {
        name: "description",
        content: "Create, edit, complete and delete tasks with priorities and deadlines.",
      },
      { property: "og:title", content: "My Tasks" },
      { property: "og:description", content: "Manage your task list and track completion." },
    ],
  }),
  component: Tasks,
});

function Tasks() {
  const { tasks, addTask, updateTask, removeTask } = useTasks();
  const { log } = useHistory();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const completed = tasks.filter((t) => t.done).length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <AppShell title="My Tasks" description="Everything you and the assistant have captured.">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add task</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim()) {
                  setError("Task name is required.");
                  return;
                }
                addTask({ title: title.trim(), priority, deadline, duration: "", notes: "" });
                log({ kind: "task", title: "Task created", detail: title.trim() });
                setTitle("");
                setDeadline("");
                setError(null);
                toast.success("Task added");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="new-task">Task</Label>
                <Input
                  id="new-task"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Review budget"
                  aria-invalid={error ? true : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                  <SelectTrigger id="new-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-deadline">Deadline</Label>
                <Input
                  id="new-deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Friday"
                />
              </div>
              <Button type="submit">
                <Plus aria-hidden className="size-4" /> Add
              </Button>
            </form>
            {error && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Progress — {completed} of {tasks.length} complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={percent} aria-label={`${percent}% of tasks complete`} />
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tasks yet. Add one above or create tasks from a meeting summary.
              </p>
            )}
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
                >
                  <Checkbox
                    id={`done-${t.id}`}
                    checked={t.done}
                    onCheckedChange={(v) => updateTask(t.id, { done: Boolean(v) })}
                  />
                  {editingId === t.id ? (
                    <Input
                      className="max-w-sm"
                      value={editValue}
                      autoFocus
                      aria-label="Edit task name"
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        if (editValue.trim()) updateTask(t.id, { title: editValue.trim() });
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    />
                  ) : (
                    <label
                      htmlFor={`done-${t.id}`}
                      className={`flex-1 text-sm font-medium ${t.done ? "line-through opacity-60" : ""}`}
                    >
                      {t.title}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {t.deadline || "no deadline"}
                      </span>
                    </label>
                  )}
                  <PriorityBadge priority={t.priority} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(t.id);
                      setEditValue(t.title);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${t.title}`}
                    onClick={() => removeTask(t.id)}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
