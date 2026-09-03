import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistory, timeAgo } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History | AI Productivity Assistant" },
      {
        name: "description",
        content: "Review your past meeting summaries, generated schedules and research sessions.",
      },
      { property: "og:title", content: "History" },
      { property: "og:description", content: "Your recent AI activity in one timeline." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history, clear } = useHistory();

  return (
    <AppShell title="History" description="A timeline of everything the assistant has produced.">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Activity</CardTitle>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clear}>
              Clear history
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((h) => (
                <li key={h.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{h.title}</p>
                    <p className="text-sm text-muted-foreground">{h.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(h.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
