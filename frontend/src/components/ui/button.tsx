import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 btn-press hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(66,165,245,0.18)] active:translate-y-0 active:scale-[0.98]",
          {
            "bg-secondary text-on-secondary hover:bg-tertiary hover:text-on-tertiary": variant === "default",
            "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-on-surface hover:bg-[rgba(255,255,255,0.1)] backdrop-blur-[12px]": variant === "secondary",
            "border border-outline text-on-surface hover:bg-[rgba(255,255,255,0.05)]": variant === "outline",
            "hover:bg-[rgba(255,255,255,0.05)] text-tertiary": variant === "ghost",
            "bg-error text-on-error hover:bg-[#ff897d]": variant === "danger",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
