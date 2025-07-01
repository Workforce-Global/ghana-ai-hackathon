"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// --- Context ---

interface SidebarContextValue {
  isCollapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebarContext() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}

// --- Provider ---

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setCollapsed] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

// --- Components ---

const sidebarVariants = cva(
  "flex flex-col border-r bg-background transition-[width] duration-300",
  {
    variants: {
      collapsible: {
        icon: "group data-[collapsed=true]:w-14",
      },
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  asChild?: boolean
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsible, asChild = false, ...props }, ref) => {
    const { isCollapsed } = useSidebarContext()
    const Comp = asChild ? Slot : "div"

    return (
      <Comp
        ref={ref}
        data-collapsed={isCollapsed}
        data-collapsible={collapsible}
        className={cn(sidebarVariants({ collapsible }), "w-64", className)}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-16 items-center p-2", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-col gap-y-1 p-2", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "group flex w-full items-center gap-x-3.5 rounded-md px-2.5 py-2 text-start text-sm font-medium disabled:pointer-events-none disabled:opacity-50 transition-colors",
  {
    variants: {
      isActive: {
        true: "bg-muted text-primary",
        false: "text-muted-foreground hover:text-primary hover:bg-muted",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  tooltip?: {
    children: React.ReactNode
    contentProps?: React.ComponentProps<typeof TooltipContent>
  }
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    { className, isActive, asChild = false, tooltip, ...props },
    ref
  ) => {
    const { isCollapsed } = useSidebarContext()
    const Comp = asChild ? Slot : "button"

    const button = (
      <Comp
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ isActive }), className)}
        {...props}
      />
    )

    if (isCollapsed && tooltip) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" {...tooltip.contentProps}>
              {tooltip.children}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebarContext()
  return (
    <div
      ref={ref}
      data-collapsed={isCollapsed}
      className={cn(
        "transition-[margin-left] duration-300 md:data-[collapsed=false]:ml-64",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"
