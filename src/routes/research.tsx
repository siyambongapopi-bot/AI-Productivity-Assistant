import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Copy, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AIDisclaimer,
  EmptyState,
  ErrorState,
  LoadingState,
  Section,
} from "@/components/AiStates";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { researchTopic, type ResearchResult } from "@/lib/ai.functions";
import { useHistory } from "@/lib/store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant | AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Research a topic, question or article and get an overview, key insights, arguments and next questions.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Structured research summaries without fabricated citations.",
      },
    ],
  }),
  component: Research,
});

function Research() {
  const [query, setQuery] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const run = useServerFn(researchTopic);
  const { log } = useHistory();

  const mutation = useMutation({
    mutationFn: (q: string) => run({ data: { query: q } }) as Promise<ResearchResult>,
    onSuccess: () =>
      log({ kind: "research", title: "Research session completed", detail: "Research Assistant" }),
  });

  const submit = () => {
    if (query.trim().length < 10) {
      setValidation("Please describe your topic or question in a bit more detail.");
      return;
    }
    setValidation(null);
    mutation.mutate(query);
  };

  const result = mutation.data;

  return (
    <AppShell
      title="AI Research Assistant"
      description="Enter a topic, question, article or set of notes and get a structured briefing."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="research">Research topic, question or text</Label>
              <Textarea
                id="research"
                rows={14}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-invalid={validation ? true : undefined}
                aria-describedby={validation ? "research-error" : undefined}
                placeholder="e.g. What are the benefits and risks of renewable energy? You can also paste an article or your notes and add specific requirements."
              />
              {validation && (
                <p id="research-error" role="alert" className="text-sm text-destructive">
                  {validation}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={submit} disabled={mutation.isPending}>
                <Search aria-hidden className="size-4" /> Research
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setValidation(null);
                  mutation.reset();
                }}
              >
                <Trash2 aria-hidden className="size-4" /> Clear
              </Button>
            </div>
            <AIDisclaimer variant="research" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mutation.isPending && <LoadingState label="Researching your topic..." />}
            {mutation.isError && (
              <ErrorState
                message={(mutation.error as Error)?.message}
                onRetry={() => mutation.mutate(query)}
              />
            )}
            {!mutation.isPending && !mutation.isError && !result && <EmptyState />}

            {result && !mutation.isPending && (
              <>
                <Section title="Overview">
                  <p className="text-sm leading-relaxed">{result.overview}</p>
                </Section>

                <Section title="Key Insights">
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.insights?.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </Section>

                <Section title="Main Arguments">
                  <div className="space-y-3">
                    {result.arguments?.map((a, i) => (
                      <div key={i} className="rounded-lg border border-border p-3 text-sm">
                        <p className="font-medium">{a.position}</p>
                        <p className="mt-1 text-muted-foreground">{a.detail}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Recommendations">
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.recommendations?.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </Section>

                <Section title="Further Questions">
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {result.furtherQuestions?.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </Section>

                <Section title="Sources / References">
                  {result.sources?.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {result.sources.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {result.sourceNote ||
                        "No verified external sources were used. This response is based on the information you provided and general knowledge."}
                    </p>
                  )}
                </Section>

                <Button
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                    toast.success("Research copied to clipboard");
                  }}
                >
                  <Copy aria-hidden className="size-4" /> Copy Research
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
