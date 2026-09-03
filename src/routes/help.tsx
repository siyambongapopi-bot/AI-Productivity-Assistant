import { Link, createFileRoute } from "@tanstack/react-router";

import { AIDisclaimer } from "@/components/AiStates";
import { AppShell } from "@/components/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help | AI Productivity Assistant" },
      {
        name: "description",
        content: "How to use the meeting summarizer, task planner and research assistant.",
      },
      { property: "og:title", content: "Help" },
      { property: "og:description", content: "Guides and answers for the AI tools." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <AppShell title="Help" description="Short guides for each tool and how the AI behaves.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="meeting">
                <AccordionTrigger>Meeting Summarizer</AccordionTrigger>
                <AccordionContent>
                  Paste or upload your notes on the{" "}
                  <Link to="/meeting-summarizer" className="text-accent underline">
                    summarizer page
                  </Link>{" "}
                  and select Summarize Meeting. You get a summary, key points, decisions, an action
                  item table and deadlines, and can turn the action items into tasks.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="planner">
                <AccordionTrigger>Task Planner</AccordionTrigger>
                <AccordionContent>
                  Add tasks with priority, deadline and estimated duration on the{" "}
                  <Link to="/task-planner" className="text-accent underline">
                    planner page
                  </Link>
                  , then generate a daily or weekly schedule, or just prioritise the list.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="research">
                <AccordionTrigger>Research Assistant</AccordionTrigger>
                <AccordionContent>
                  Enter a topic, question or article on the{" "}
                  <Link to="/research" className="text-accent underline">
                    research page
                  </Link>{" "}
                  for an overview, insights, main arguments, recommendations and follow-up
                  questions.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How the AI behaves</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The assistant is instructed to use only the information you provide, to mark unclear
              owners, dates or decisions as uncertain, and never to fabricate citations, statistics
              or URLs.
            </p>
            <p>
              It has no live web access, so research answers are based on your input and general
              knowledge. Verify anything important independently.
            </p>
            <AIDisclaimer variant="research" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
