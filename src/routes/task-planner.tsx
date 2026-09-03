import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays, CalendarRange, ListOrdered, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AIDisclaimer,
  EmptyState,
  ErrorState,
  LoadingState,
  PriorityBadge,
  Section,
} from "@/components/AiStates";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { planSchedule, type SchedulePlan } from "@/lib/ai.functions";
import { useHistory, useTasks, type Task } from "@/lib/store";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Turn your task list into a realistic daily or weekly schedule with priorities and breaks.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Generate realistic daily and weekly schedules from your task list.",
      },
    ],
  }),
  component: TaskPlanner,
});

type Mode = "daily" | "weekly" | "prioritize";

function TaskPlanner() {
  const { tasks, addTask, updateTask, removeTask } = useTasks();
  const { log } = useHistory();
  const run = useServerFn(planSchedule);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [workingHours, setWorkingHours] = useState("09:00-17:00");
  const [validation, setValidation] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("daily");

  const mutation = useMutation({
    mutationFn: (m: Mode) =>
      run({
        data: {
          mode: m,
          workingHours,
          tasks: tasks
            .filter((t) => !t.done)
            .map((t) => ({
              title: t.title,
              priority: t.priority,
              deadline: t.deadline,
              duration: t.duration,
              notes: t.notes,
            })),
        },
      }) as Promise<SchedulePlan>,
    onSuccess: (_d, m) =>
      log({
        kind: "schedule",
        title: m === "prioritize" ? "Tasks prioritized" : `${m === "daily" ? "Daily" : "Weekly"} schedule generated`,
        detail: "Task Planner",
      }),
  });

  const generate = (m: Mode) => {
    if (tasks.filter((t) => !t.done).length === 0) {
      setValidation("Add at least one pending task before generating a schedule.");
      return;
    }
    setValidation(null);
    setMode(m);
    mutation.mutate(m);
  };

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidation("Task name is required.");
      return;
    }
    addTask({ title: title.trim(), priority, deadline, duration, notes });
    setTitle("");
    setDeadline("");
    setDuration("");
    setNotes("");
    setValidation(null);
    toast.success("Task added");
  };

  const plan = mutation.data;

  return (
    <AppShell
      title="AI Task Planner"
      description="Add your tasks, then let the assistant build a realistic daily or weekly plan."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add a task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task</Label>
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Finish project presentation"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(v) => setPriority(v as Task["priority"])}
                    >
                      <SelectTrigger id="task-priority">
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
                    <Label htmlFor="task-deadline">Deadline</Label>
                    <Input
                      id="task-deadline"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="Friday"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-duration">Estimated duration</Label>
                    <Input
                      id="task-duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="2 hours"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-notes">Notes (optional)</Label>
                  <Textarea
                    id="task-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Dependencies, context or links"
                  />
                </div>
                <Button type="submit">
                  <Plus aria-hidden className="size-4" /> Add task
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your tasks ({tasks.filter((t) => !t.done).length} pending)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              )}
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${t.done ? "line-through opacity-60" : ""}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.deadline || "no deadline"} · {t.duration || "duration unspecified"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTask(t.id, { done: !t.done })}
                    >
                      {t.done ? "Reopen" : "Complete"}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${t.title}`}
                      onClick={() => removeTask(t.id)}
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-2">
                <Label htmlFor="hours">Available working hours</Label>
                <Input
                  id="hours"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="09:00-17:00"
                  className="max-w-xs"
                />
              </div>

              {validation && (
                <p role="alert" className="text-sm text-destructive">
                  {validation}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => generate("daily")} disabled={mutation.isPending}>
                  <CalendarDays aria-hidden className="size-4" /> Generate Daily Schedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generate("weekly")}
                  disabled={mutation.isPending}
                >
                  <CalendarRange aria-hidden className="size-4" /> Generate Weekly Schedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generate("prioritize")}
                  disabled={mutation.isPending}
                >
                  <ListOrdered aria-hidden className="size-4" /> Prioritize Tasks
                </Button>
              </div>
              <AIDisclaimer />
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-24 lg:self-start">
          <CardHeader>
            <CardTitle>AI Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mutation.isPending && <LoadingState label="Building a realistic schedule..." />}
            {mutation.isError && (
              <ErrorState
                message={(mutation.error as Error)?.message}
                onRetry={() => mutation.mutate(mode)}
              />
            )}
            {!mutation.isPending && !mutation.isError && !plan && <EmptyState />}

            {plan && !mutation.isPending && (
              <>
                {plan.warnings?.length > 0 && (
                  <div
                    role="status"
                    className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm"
                  >
                    <p className="font-medium">Workload notes</p>
                    <ul className="mt-1 list-disc pl-5">
                      {plan.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.days?.map((d) => (
                  <Section key={d.day} title={d.day}>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-40">Time</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Priority</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {d.blocks.map((b, i) => (
                            <TableRow key={i}>
                              <TableCell className="whitespace-nowrap tabular-nums">
                                {b.start} – {b.end}
                              </TableCell>
                              <TableCell className="font-medium">{b.task}</TableCell>
                              <TableCell>
                                <PriorityBadge priority={b.priority} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Section>
                ))}

                {plan.prioritized?.length > 0 && (
                  <Section title="Prioritized order">
                    <ol className="space-y-2 text-sm">
                      {plan.prioritized.map((p, i) => (
                        <li key={i} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">
                              {i + 1}. {p.task}
                            </span>
                            <PriorityBadge priority={p.priority} />
                          </div>
                          <p className="mt-1 text-muted-foreground">{p.reason}</p>
                        </li>
                      ))}
                    </ol>
                  </Section>
                )}

                {plan.notes && <p className="text-xs text-muted-foreground">{plan.notes}</p>}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
