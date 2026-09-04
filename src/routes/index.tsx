import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  FileText,
  ListTodo,
  Plus,
} from "lucide-react";

import { AIDisclaimer } from "@/components/AiStates";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistory, useTasks, timeAgo } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | AI Productivity Assistant" },
      {
        name: "description",
        content:
          "Track tasks and launch AI tools that summarise meetings, plan your day and research topics.",
      },
      { property: "og:title", content: "Dashboard | AI Productivity Assistant" },
      {
        property: "og:description",
        content: "Your AI-powered workspace for meetings, schedules and research.",
      },
    ],
  }),
  component: Dashboard,
});

const QUICK_ACTIONS = [
  { to: "/meeting-summarizer", label: "Summarize Meeting", icon: FileText },
  { to: "/task-planner", label: "Plan My Day", icon: CalendarDays },
  { to: "/task-planner", label: "Plan My Week", icon: CalendarRange },
  { to: "/research", label: "Research a Topic", icon: BookOpen },
  { to: "/tasks", label: "Add Task", icon: Plus },
] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const { tasks } = useTasks();
  const { history } = useHistory();

  const completed = tasks.filter((t) => t.done).length;
  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: ListTodo },
    { label: "Completed", value: completed, icon: CheckCircle2 },
    { label: "Pending", value: tasks.length - completed, icon: Clock },
    {
      label: "Meetings Summarized",
      value: history.filter((h) => h.kind === "meeting").length,
      icon: FileText,
    },
    {
      label: "Research Sessions",
      value: history.filter((h) => h.kind === "research").length,
      icon: BookOpen,
    },
  ];

  return (
    <AppShell
      title={`${greeting()}, Siyambonga`}
      description="Here is your productivity snapshot. Small, focused blocks of work beat long unstructured hours."
    >
      <div className="space-y-8">
        <section aria-label="Overview" className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="surface-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon aria-hidden className="size-4 text-accent" />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </section>

        <section aria-label="Quick actions" className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="surface-card flex items-center gap-3 p-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start with a meeting summary or a plan for your day.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {history.slice(0, 8).map((h) => (
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

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.filter((t) => !t.done).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing pending. Add a task from{" "}
                  <Link to="/tasks" className="text-accent underline">
                    My Tasks
                  </Link>
                  .
                </p>
              ) : (
                tasks
                  .filter((t) => !t.done)
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.priority} priority · {t.deadline || "no deadline"}
                      </p>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        <AIDisclaimer />
      </div>
    </AppShell>
  );
}
