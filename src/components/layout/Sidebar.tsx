"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Moon,
  Sun,
  LogOut,
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
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen shrink-0 border-r border-border transition-all duration-300 print:hidden",
        "bg-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary shrink-0">
          <GraduationCap className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base text-sidebar-foreground tracking-tight">
            Tacto
          </span>
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
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings link */}
      <div className="px-2 py-2 border-t border-sidebar-border">
        <Link
          href="/conta"
          className={cn(
            "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/conta"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          title={collapsed ? "Configurações" : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </Link>
        
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 px-2.5 py-2 mt-1 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          title={collapsed ? "Alternar tema" : undefined}
        >
          {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{isDark ? "Modo claro" : "Modo escuro"}</span>}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center gap-3 px-2.5 py-2 mt-1 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>

        {/* User info */}
        {session?.user && !collapsed && (
          <div className="mt-3 pt-3 border-t border-sidebar-border px-2.5">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{session.user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-[3.5rem] z-10 flex items-center justify-center",
          "w-6 h-6 rounded-full border border-sidebar-border bg-sidebar",
          "text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        )}
        aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
