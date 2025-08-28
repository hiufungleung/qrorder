import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800",
        destructive:
          "bg-gradient-to-r from-rose-500 to-red-600 dark:from-rose-600 dark:to-red-700 text-white shadow-md hover:shadow-lg hover:from-rose-600 hover:to-red-700 dark:hover:from-rose-700 dark:hover:to-red-800",
        outline:
          "border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-900 dark:hover:text-indigo-100",
        secondary:
          "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-900/30 shadow-sm hover:shadow-md",
        ghost: "text-gray-900 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-900 dark:hover:text-indigo-100",
        link: "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-700 dark:hover:text-indigo-300",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }