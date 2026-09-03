import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CalendarRange,
  CheckSquare,
  FileText,
  History,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: FileText },
  { to: "/task-planner", label: "Task Planner", icon: CalendarRange },
  { to: "/research", label: "Research Assistant", icon: BookOpen },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: LifeBuoy },
] as const;

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Zap aria-hidden className="size-4" />
      </span>
      {!collapsed && (
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          AI Productivity Assistant
        </span>
      )}
    </div>
  );
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <Brand collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto">
          <NavList collapsed={collapsed} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden className="size-4" />
            ) : (
              <>
                <PanelLeftClose aria-hidden className="size-4" /> Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu aria-hidden className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavList onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <form
            role="search"
            className="relative hidden max-w-sm flex-1 md:block"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="global-search" className="sr-only">
              Search
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input id="global-search" placeholder="Search tasks and tools" className="pl-9" />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell aria-hidden className="size-4" />
            </Button>
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3"
            >
              <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                SN
              </span>
              <span className="hidden text-sm font-medium sm:inline">Siyambonga</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
