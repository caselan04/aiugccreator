
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "heading" | "mono" | "rounded" | "condensed" | "elegant" | "playful" | "system-ui" | "ubuntu" | "oxygen"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const fontClasses = {
      default: "font-sans",
      heading: "font-serif",
      mono: "font-mono",
      rounded: "font-open-sans",
      condensed: "font-roboto-condensed",
      elegant: "font-playfair",
      playful: "font-['Comic_Sans_MS']",
      "system-ui": "font-['system-ui']",
      ubuntu: "font-['Ubuntu']",
      oxygen: "font-['Oxygen']"
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          fontClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
