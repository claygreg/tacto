"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EditableTitleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  onSave?: (value: string) => void;
  textClassName?: string;
}

export const EditableTitle = React.forwardRef<HTMLInputElement, EditableTitleProps>(
  ({ value, onValueChange, onSave, className, textClassName, placeholder = "Sem título", onBlur, onKeyDown, ...props }, ref) => {
    return (
      <div className={cn("flex items-center max-w-[50vw]", className)}>
        <div className="grid items-center min-w-[50px] max-w-full relative">
          <span
            className={cn(
              "col-start-1 row-start-1 invisible whitespace-pre px-2 py-0.5 overflow-hidden text-ellipsis",
              textClassName
            )}
          >
            {value || placeholder}
          </span>
          <input
            {...props}
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onBlur={(e) => {
              if (onSave) onSave(e.target.value);
              if (onBlur) onBlur(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                e.currentTarget.blur();
              }
              if (onKeyDown) onKeyDown(e);
            }}
            placeholder={placeholder}
            className={cn(
              "col-start-1 row-start-1 w-full bg-transparent border border-transparent rounded-md px-2 py-0.5 outline-none text-ellipsis overflow-hidden transition-all duration-200",
              "hover:border-border hover:bg-muted/30",
              "focus:border-border focus:bg-background focus:ring-2 focus:ring-ring focus:ring-offset-1",
              textClassName
            )}
          />
        </div>
      </div>
    );
  }
);

EditableTitle.displayName = "EditableTitle";
