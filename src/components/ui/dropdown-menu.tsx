import * as React from "react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";

import { cn } from "@/lib/utils";

const DropdownMenu = ({ children, ...props }: { children: React.ReactNode }) => (
  <HeadlessMenu as="div" className="relative">
    {children}
  </HeadlessMenu>
);

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ asChild, children, className, ...props }, ref) => {
  // Если children undefined или null, возвращаем null
  if (children === undefined || children === null) {
    return null;
  }
  
  if (asChild && React.isValidElement(children)) {
    return (
      <HeadlessMenu.Button as={React.Fragment}>
        {React.cloneElement(children, { ref, ...props })}
      </HeadlessMenu.Button>
    );
  }
  return (
    <HeadlessMenu.Button
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {children}
    </HeadlessMenu.Button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "end";
    sideOffset?: number;
  }
>(({ className, align = "start", sideOffset = 4, children, ...props }, ref) => (
  <Transition
    as={React.Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <HeadlessMenu.Items
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className,
      )}
      style={{ marginTop: `${sideOffset}px` }}
      {...props}
    >
      {children}
    </HeadlessMenu.Items>
  </Transition>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
  }
>(({ className, inset, onClick, ...props }, ref) => (
  <HeadlessMenu.Item>
    {({ active, disabled }) => (
      <div
        ref={ref}
        onClick={disabled ? undefined : onClick}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          disabled && "pointer-events-none opacity-50",
          active && "bg-accent text-accent-foreground",
          inset && "pl-8",
          className,
        )}
        {...props}
      />
    )}
  </HeadlessMenu.Item>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
