import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { callAiJson } from "./ai.server";

export type MeetingSummary = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; priority: "High" | "Medium" | "Low" | string }[];
  deadlines: { item: string; date: string }[];
  notes?: string;
};

export type ScheduleBlock = {
  start: string;
  end: string;
  task: string;
  priority: "High" | "Medium" | "Low" | "Break" | string;
};

export type SchedulePlan = {
  days: { day: string; blocks: ScheduleBlock[] }[];
  prioritized: { task: string; priority: string; reason: string }[];
  warnings: string[];
  notes: string;
};

export type ResearchResult = {
  overview: string;
  insights: string[];
  arguments: { position: string; detail: string }[];
  recommendations: string[];
  furtherQuestions: string[];
  sources: string[];
  sourceNote: string;
};

const meetingInput = z.object({ notes: z.string().min(20, "Please enter more meeting notes.") });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => meetingInput.parse(d))
  .handler(async ({ data }) => {
    return await callAiJson<MeetingSummary>(
      `You summarise meeting notes for a productivity app. Use only what the notes contain.
Return json with keys: summary (string), keyPoints (string[]), decisions (string[]),
actionItems (array of {task, owner, priority}), deadlines (array of {item, date}), notes (string).
If an owner, priority or date is not stated, use "Uncertain".`,
      `Meeting notes:\n\n${data.notes}`,
    );
  });

const plannerInput = z.object({
  mode: z.enum(["daily", "weekly", "prioritize"]),
  workingHours: z.string().default("09:00-17:00"),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1),
        priority: z.string(),
        deadline: z.string().optional().default(""),
        duration: z.string().optional().default(""),
        notes: z.string().optional().default(""),
      }),
    )
    .min(1, "Add at least one task."),
});

export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => plannerInput.parse(d))
  .handler(async ({ data }) => {
    const goal =
      data.mode === "daily"
        ? "Build a realistic single-day schedule (one entry in days)."
        : data.mode === "weekly"
          ? "Build a realistic Monday-to-Friday schedule (one entry in days per weekday used)."
          : "Only prioritise the tasks; return an empty days array.";
    return await callAiJson<SchedulePlan>(
      `You are a scheduling assistant. ${goal}
Respect priorities, deadlines, estimated durations and the available working hours.
Insert short breaks. Never overload the day: if the workload exceeds available time, say so in warnings.
Return json with keys: days (array of {day, blocks:[{start,end,task,priority}]}),
prioritized (array of {task, priority, reason}), warnings (string[]), notes (string).
Use "Break" as the priority for break blocks. Times use 24-hour HH:MM.`,
      `Working hours: ${data.workingHours}\nTasks:\n${data.tasks
        .map(
          (t, i) =>
            `${i + 1}. ${t.title} | priority: ${t.priority} | deadline: ${t.deadline || "none"} | duration: ${t.duration || "unspecified"} | notes: ${t.notes || "none"}`,
        )
        .join("\n")}`,
    );
  });

const researchInput = z.object({
  query: z.string().min(10, "Please describe what you want to research."),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => researchInput.parse(d))
  .handler(async ({ data }) => {
    return await callAiJson<ResearchResult>(
      `You are a careful research assistant with no live web access.
Return json with keys: overview (string), insights (string[]), arguments (array of {position, detail}),
recommendations (string[]), furtherQuestions (string[]), sources (string[]), sourceNote (string).
Leave sources empty unless the user supplied them; put an honest statement in sourceNote that the
answer is based on the provided text and general knowledge, not verified live sources.`,
      data.query,
    );
  });
