 'use client';

import * as React from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <HeadlessSwitch
        checked={checked}
        onChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          // track
          "relative inline-flex h-6 w-14 shrink-0 rounded-full transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          checked ? "bg-[#B9C9F7]" : "bg-[#E5E7EB]",
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            // knob (bigger than track like on the image)
            "absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full shadow-md pointer-events-none",
            "transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5 bg-[#2F6FED]" : "translate-x-0 bg-white border border-[#D1D5DB]"
          )}
        />
      </HeadlessSwitch>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
