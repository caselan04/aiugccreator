
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";

function Component() {
  const id = useId();
  return (
    <div className="space-y-2 min-w-[300px]">
      <Label htmlFor={id}></Label>
      <div className="flex rounded-lg shadow-sm shadow-black/5">
        <Input
          id={id}
          className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10 bg-primary text-primary-foreground placeholder:text-primary-foreground/70"
          placeholder="you@example.com"
          type="email"
        />
        <button className="inline-flex items-center rounded-e-lg border border-input bg-primary px-3 text-sm font-medium text-primary-foreground outline-offset-2 transition-colors hover:bg-primary/90 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50">
          Join waitlist
        </button>
      </div>
    </div>
  );
}

export { Component };
