import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AIDisclaimer } from "@/components/AiStates";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | AI Productivity Assistant" },
      {
        name: "description",
        content: "Set your display name, working hours and assistant preferences.",
      },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Personalise your productivity workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("Siyambonga");
  const [hours, setHours] = useState("09:00-17:00");
  const [breaks, setBreaks] = useState(true);

  return (
    <AppShell title="Settings" description="Personalise how the assistant plans your work.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile & preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Default working hours</Label>
              <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="breaks">Include breaks in generated schedules</Label>
              <Switch id="breaks" checked={breaks} onCheckedChange={setBreaks} />
            </div>
            <Button onClick={() => toast.success("Preferences saved on this device")}>
              Save preferences
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Tasks and activity history are stored locally in your browser. Text you send to an AI
              tool is processed by the AI service to generate a response and is not used to build a
              profile of you.
            </p>
            <p>
              API keys are stored as server-side secrets and are never exposed to the browser or the
              repository.
            </p>
            <AIDisclaimer />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
