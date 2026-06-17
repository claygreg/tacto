"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bell, Settings, User, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map route segments to display labels
const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Início",
  questoes: "Questões",
  provas: "Provas",
  diagnostico: "Diagnóstico",
  turmas: "Turmas",
  conta: "Configurações",
  perfil: "Perfil",
  tabulacao: "Tabulação",
  nova: "Nova",
  editar: "Editar",
};

function buildBreadcrumb(pathname: string, segmentMap: Record<string, string>): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];

  segments.forEach((seg, i) => {
    const isId = /^[0-9a-f-]{8,}$|^\d+$/.test(seg);
    const href = "/" + segments.slice(0, i + 1).join("/");
    
    // Check if we have a known name for this segment (e.g. ID)
    if (segmentMap[seg]) {
      crumbs.push({ label: segmentMap[seg], href });
      return;
    }

    if (isId) {
      crumbs.push({ label: "Detalhes", href });
      return;
    }

    const label = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, href });
  });

  return crumbs;
}

export interface AppHeaderProps {
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export function AppHeader({ breadcrumb: breadcrumbProp, className }: AppHeaderProps) {
  const { data: session } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { breadcrumbs: contextBreadcrumbs, segmentMap } = useBreadcrumb();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  // Use prop if provided, else context, else derive from current pathname
  const breadcrumb = breadcrumbProp ?? contextBreadcrumbs ?? buildBreadcrumb(pathname, segmentMap);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header
      className={cn(
        "flex items-center justify-between h-14 px-6 border-b border-border bg-sidebar shrink-0 print:hidden",
        className
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumb.length > 0 ? (
            breadcrumb.map((crumb, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <React.Fragment key={crumb.label + i}>
                  <BreadcrumbItem>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Tacto</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-0 select-none"
            aria-label="Menu do usuário"
          >
            {initials}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {/* User info header — GroupLabel inside Group */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-medium leading-none">
                    {session?.user?.name || "Usuário"}
                  </span>
                  <span className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || ""}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/perfil")}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/conta")}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                {mounted ? (
                  isDark ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {mounted ? (isDark ? "Modo claro" : "Modo escuro") : "Tema"}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
