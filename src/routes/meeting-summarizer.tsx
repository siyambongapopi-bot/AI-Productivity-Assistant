import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Copy, ListPlus, Save, Sparkles, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting, type MeetingSummary } from "@/lib/ai.functions";
import { useHistory, useTasks } from "@/lib/store";

export const Route = createFileRoute("/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a summary with key points, decisions, action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Extract decisions, owners and deadlines from your meeting notes with AI.",
      },
    ],
  }),
  component: MeetingSummarizer,
});

function MeetingSummarizer() {
  const [notes, setNotes] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const run = useServerFn(summarizeMeeting);
  const { addMany } = useTasks();
  const { log } = useHistory();

  const mutation = useMutation({
    mutationFn: (value: string) => run({ data: { notes: value } }) as Promise<MeetingSummary>,
    onSuccess: () =>
      log({ kind: "meeting", title: "Meeting summary created", detail: "Meeting Summarizer" }),
  });

  const submit = () => {
    if (notes.trim().length < 20) {
      setValidation("Please enter at least a few sentences of meeting notes.");
      return;
    }
    setValidation(null);
    mutation.mutate(notes);
  };

  const result = mutation.data;

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Paste your notes and get a structured summary with decisions, owners and deadlines."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Meeting notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={14}
                aria-invalid={validation ? true : undefined}
                aria-describedby={validation ? "notes-error" : undefined}
                placeholder="Paste your meeting notes here... include who attended, what was discussed, decisions taken and any deadlines."
              />
              {validation && (
                <p id="notes-error" role="alert" className="text-sm text-destructive">
                  {validation}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={submit} disabled={mutation.isPending}>
                <Sparkles aria-hidden className="size-4" /> Summarize Meeting
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNotes("");
                  setValidation(null);
                  mutation.reset();
                }}
              >
                <Trash2 aria-hidden className="size-4" /> Clear
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload aria-hidden className="size-4" /> Upload .txt
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,text/plain"
                className="sr-only"
                aria-label="Upload a text file of meeting notes"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setNotes(await file.text());
                  e.target.value = "";
                }}
              />
            </div>
            <AIDisclaimer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mutation.isPending && <LoadingState />}
            {mutation.isError && (
              <ErrorState
                message={(mutation.error as Error)?.message}
                onRetry={() => mutation.mutate(notes)}
              />
            )}
            {!mutation.isPending && !mutation.isError && !result && <EmptyState />}

            {result && !mutation.isPending && (
              <>
                <Section title="Meeting Summary">
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </Section>

                <Section title="Key Discussion Points">
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.keyPoints?.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </Section>

                <Section title="Decisions Made">
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.decisions?.length ? (
                      result.decisions.map((d, i) => <li key={i}>{d}</li>)
                    ) : (
                      <li className="text-muted-foreground">No decisions stated in the notes.</li>
                    )}
                  </ul>
                </Section>

                <Section title="Action Items">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Responsible</TableHead>
                          <TableHead>Priority</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.actionItems?.map((a, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{a.task}</TableCell>
                            <TableCell>{a.owner}</TableCell>
                            <TableCell>
                              <PriorityBadge priority={a.priority} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Section>

                <Section title="Deadlines">
                  <ul className="space-y-1 text-sm">
                    {result.deadlines?.length ? (
                      result.deadlines.map((d, i) => (
                        <li key={i} className="flex justify-between gap-4 border-b border-border py-1">
                          <span>{d.item}</span>
                          <span className="text-muted-foreground">{d.date}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No deadlines found in the notes.</li>
                    )}
                  </ul>
                </Section>

                {result.notes && <p className="text-xs text-muted-foreground">{result.notes}</p>}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      void navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                      toast.success("Summary copied to clipboard");
                    }}
                  >
                    <Copy aria-hidden className="size-4" /> Copy Summary
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      log({
                        kind: "meeting",
                        title: "Meeting summary saved",
                        detail: result.summary.slice(0, 90),
                      });
                      toast.success("Saved to history");
                    }}
                  >
                    <Save aria-hidden className="size-4" /> Save Summary
                  </Button>
                  <Button
                    onClick={() => {
                      const items = (result.actionItems ?? []).map((a) => ({
                        title: a.task,
                        priority: (["High", "Medium", "Low"].includes(a.priority)
                          ? a.priority
                          : "Medium") as "High" | "Medium" | "Low",
                        deadline: "",
                        duration: "",
                        notes: `Owner: ${a.owner}`,
                      }));
                      if (!items.length) return toast.error("No action items to create");
                      addMany(items);
                      log({
                        kind: "task",
                        title: `${items.length} tasks created`,
                        detail: "From meeting summary",
                      });
                      toast.success(`${items.length} tasks added`);
                    }}
                  >
                    <ListPlus aria-hidden className="size-4" /> Create Tasks
                  </Button>
                  <Button variant="ghost" onClick={() => mutation.reset()}>
                    Clear
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
