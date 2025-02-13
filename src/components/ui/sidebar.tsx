
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const SidebarContext = React.createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = React.useContext(SidebarContext);
  return (
    <div
      ref={ref}
      className={cn(
        "border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-full w-full flex-col", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-2", className)} {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-2 px-4 text-xs font-semibold", className)}
    {...props}
  />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)} {...props} />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const menuItemVariants = cva(
  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900",
  {
    variants: {
      variant: {
        default: "text-neutral-700",
        active: "bg-neutral-100 text-neutral-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SidebarMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof menuItemVariants> {}

export const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  SidebarMenuItemProps
>(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(menuItemVariants({ variant }), className)}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full cursor-pointer", className)}
    {...props}
  />
));
SidebarMenuButton.displayName = "SidebarMenuButton";
