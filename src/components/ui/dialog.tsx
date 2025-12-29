import * as React from "react";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import { X } from "@/components/icons";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  // Если children undefined или null, возвращаем null
  if (children === undefined || children === null) {
    return null;
  }
  
  return (
    <HeadlessDialog open={open} onClose={() => onOpenChange(false)} className="relative z-50">
      {children}
    </HeadlessDialog>
  );
};

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
>(({ asChild, children, ...props }, ref) => {
  // Если children undefined или null, возвращаем null
  if (children === undefined || children === null) {
    return null;
  }
  
  if (asChild && React.isValidElement(children)) {
    return (
      <HeadlessDialog.Button as={React.Fragment}>
        {React.cloneElement(children, { ref, ...props })}
      </HeadlessDialog.Button>
    );
  }
  return (
    <HeadlessDialog.Button ref={ref} {...props}>
      {children}
    </HeadlessDialog.Button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  // Если children undefined или null, используем пустой фрагмент
  // Также фильтруем undefined из массива children, если это массив
  let safeChildren: React.ReactNode = null;
  if (children === undefined || children === null) {
    safeChildren = null;
  } else if (Array.isArray(children)) {
    safeChildren = children.filter(child => child !== undefined && child !== null);
  } else {
    safeChildren = children;
  }
  
  return (
    <>
      <HeadlessDialog.Overlay className="fixed inset-0 bg-black/80" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <HeadlessDialog.Panel
          ref={ref}
          className={cn(
            "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
            className,
          )}
          {...props}
        >
          {safeChildren}
          <HeadlessDialog.Button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </HeadlessDialog.Button>
        </HeadlessDialog.Panel>
      </div>
    </>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const safeChildren = children === undefined || children === null ? null : children;
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
      {safeChildren}
    </div>
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const safeChildren = children === undefined || children === null ? null : children;
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props}>
      {safeChildren}
    </div>
  );
};
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  const safeChildren = children === undefined || children === null ? null : children;
  return (
    <HeadlessDialog.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {safeChildren}
    </HeadlessDialog.Title>
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const safeChildren = children === undefined || children === null ? null : children;
  return (
    <HeadlessDialog.Description 
      ref={ref} 
      className={cn("text-sm text-muted-foreground", className)} 
      {...props}
    >
      {safeChildren}
    </HeadlessDialog.Description>
  );
});
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
