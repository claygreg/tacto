"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/questoes", label: "Questões", icon: BookOpen },
  { href: "/provas", label: "Provas", icon: FileText },
  { href: "/diagnostico", label: "Diagnóstico", icon: BarChart3 },
  { href: "/turmas", label: "Turmas", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen shrink-0 border-r border-border transition-all duration-300 print:hidden",
        "bg-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
        {collapsed ? (
          <button 
            onClick={() => setCollapsed(false)}
            className="group flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary shrink-0 transition-colors"
            aria-label="Expandir sidebar"
          >
            <GraduationCap className="w-4 h-4 text-sidebar-primary-foreground group-hover:hidden" />
            <ChevronRight className="w-4 h-4 text-sidebar-primary-foreground hidden group-hover:block" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary shrink-0">
                <GraduationCap className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-base text-sidebar-foreground tracking-tight">
                Tacto
              </span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center w-6 h-6 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Recolher sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "text-sidebar-primary bg-transparent font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? label : undefined}
            >
              <div className="flex items-center justify-center w-8 h-8 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
