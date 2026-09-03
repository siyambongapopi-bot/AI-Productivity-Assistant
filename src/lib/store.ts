import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  duration: string;
  notes: string;
  done: boolean;
  createdAt: number;
};

export type HistoryEntry = {
  id: string;
  kind: "meeting" | "schedule" | "research" | "task";
  title: string;
  detail: string;
  createdAt: number;
};

const TASKS_KEY = "apa.tasks";
const HISTORY_KEY = "apa.history";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("apa:store", { detail: key }));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read<T>(key, fallback));
    const sync = () => setValue(read<T>(key, fallback));
    window.addEventListener("apa:store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("apa:store", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return [value, save] as const;
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Math.random()).slice(2);

export function useTasks() {
  const [tasks, setTasks] = useStored<Task[]>(TASKS_KEY, []);

  const addTask = (task: Omit<Task, "id" | "done" | "createdAt">) => {
    const created: Task = { ...task, id: newId(), done: false, createdAt: Date.now() };
    setTasks([created, ...read<Task[]>(TASKS_KEY, [])]);
    return created;
  };

  const addMany = (items: Omit<Task, "id" | "done" | "createdAt">[]) => {
    const created = items.map((t) => ({
      ...t,
      id: newId(),
      done: false,
      createdAt: Date.now(),
    }));
    setTasks([...created, ...read<Task[]>(TASKS_KEY, [])]);
    return created;
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks(read<Task[]>(TASKS_KEY, []).map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTask = (id: string) =>
    setTasks(read<Task[]>(TASKS_KEY, []).filter((t) => t.id !== id));

  return { tasks, addTask, addMany, updateTask, removeTask };
}

export function useHistory() {
  const [history, setHistory] = useStored<HistoryEntry[]>(HISTORY_KEY, []);

  const log = (entry: Omit<HistoryEntry, "id" | "createdAt">) =>
    setHistory(
      [
        { ...entry, id: newId(), createdAt: Date.now() },
        ...read<HistoryEntry[]>(HISTORY_KEY, []),
      ].slice(0, 100),
    );

  const clear = () => setHistory([]);

  return { history, log, clear };
}

export function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
