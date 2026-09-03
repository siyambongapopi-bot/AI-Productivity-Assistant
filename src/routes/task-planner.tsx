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
import { useHistory, useTasks } from "@/lib/store";

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
  component: TaskPlanner;
});

function TaskPlanner() {
  return null;
}
