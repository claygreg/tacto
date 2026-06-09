"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface AppHeaderProps {
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export function AppHeader({ breadcrumb, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0 print:hidden",
        className
      )}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumb && breadcrumb.length > 0 ? (
          breadcrumb.map((crumb, i) => (
            <React.Fragment key={crumb.label}>
              {i > 0 && (
                <span className="text-muted-foreground">/</span>
              )}
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">Tacto</span>
        )}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Buscar" className="text-muted-foreground hover:text-foreground">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notificações" className="text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </Button>
        {/* TODO: [API] dados reais do professor logado */}
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            MP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
