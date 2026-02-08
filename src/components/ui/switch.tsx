"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group peer relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-md transition-all duration-300 outline-none",
        "focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0e]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-emerald-500/20 data-[state=checked]:border data-[state=checked]:border-emerald-500/50",
        "data-[state=unchecked]:bg-[#18181b] data-[state=unchecked]:border data-[state=unchecked]:border-white/10",
        className
      )}
      {...props}
    >
      {/* OFF label */}
      <span className="absolute left-1.5 text-[10px] font-medium text-gray-500 transition-opacity data-[state=checked]:opacity-0 group-data-[state=unchecked]:opacity-100">
        OFF
      </span>
      {/* ON label */}
      <span className="absolute right-1.5 text-[10px] font-medium text-emerald-400 transition-opacity data-[state=unchecked]:opacity-0 group-data-[state=checked]:opacity-100">
        ON
      </span>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none flex h-5 w-5 items-center justify-center rounded transition-all duration-300",
          "data-[state=checked]:translate-x-8 data-[state=checked]:bg-emerald-500",
          "data-[state=unchecked]:translate-x-1 data-[state=unchecked]:bg-gray-600"
        )}
      >
        <Check className="h-3 w-3 text-white opacity-0 transition-opacity data-[state=checked]:opacity-100" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
