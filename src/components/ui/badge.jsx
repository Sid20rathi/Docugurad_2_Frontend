import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        success:
          "border-transparent bg-green-600 text-white [a&]:hover:bg-green-600/90 focus-visible:ring-green-500/20",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        REJECTED:
          "border-transparent bg-red-600 text-white [a&]:hover:bg-red-600/90 focus-visible:ring-red-500/20",
        APPROVED:
         "border-transparent bg-green-600 text-white [a&]:hover:bg-green-600/90 focus-visible:ring-green-500/20",
        PENDING:
         "border-transparent bg-yellow-100 text-yellow-800 [a&]:hover:bg-gray-600/90 focus-visible:ring-gray-500/20",
        MODT_Approved:
         "border-transparent bg-orange-200 text-orange-800 [a&]:hover:bg-gray-600/90 focus-visible:ring-gray-500/20",
        NOI_Index2_Approved:
         "border-transparent bg-orange-200 text-orange-800 [a&]:hover:bg-gray-600/90 focus-visible:ring-gray-500/20",
        
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
