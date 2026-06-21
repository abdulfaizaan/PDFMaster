import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles: transform scale(0.95) on active is the system-wide micro-interaction
  "group/button inline-flex items-center justify-center whitespace-nowrap outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 font-sans active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-primary-focus transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary rounded-pill",
        destructive: "bg-red-500 text-white rounded-pill hover:bg-red-600",
        outline: "border border-hairline bg-transparent hover:bg-surface-soft text-ink rounded-pill",
        secondary: "bg-surface-soft text-ink hover:bg-surface-cream-strong rounded-pill",
        ghost: "hover:bg-surface-soft hover:text-ink text-ink rounded-md",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[22px] py-[11px] text-[17px] font-[400] leading-[1.47] tracking-[-0.374px]",
        sm: "px-[15px] py-[8px] text-[14px] font-[400] leading-[1.29] tracking-[-0.224px]",
        lg: "px-[28px] py-[14px] text-[18px] font-[400] leading-none",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  className?: string
}

export function Button({
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants(props),
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { buttonVariants }