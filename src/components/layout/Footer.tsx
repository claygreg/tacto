import * as React from "react";
import { cn } from "@/lib/utils";

export type FooterProps = React.HTMLAttributes<HTMLElement>;

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "w-full py-6 px-6 border-t border-gray-200 bg-white flex items-center justify-between text-sm text-gray-500",
          className
        )}
        {...props}
      >
        <div>© {new Date().getFullYear()} Tacto. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";
