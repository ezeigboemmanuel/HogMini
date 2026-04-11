/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withApi } from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreateFlagDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
}) {
  const [key, setKey] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!key.trim()) return setError("Please provide a flag key");
    // Ensure key is alphanumeric and underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      return setError("Key can only contain letters, numbers, underscores, and dashes");
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(withApi(`/api/projects/${projectId}/flags`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          key: key.trim(),
          description: description.trim(),
          isActive,
          rules: []
        }),
      });

      if (res.status === 409) {
        throw new Error("A flag with this key already exists in this project");
      }

      if (!res.ok) throw new Error(`Failed to create flag (${res.status})`);

      toast.success("Feature flag created successfully");
      onOpenChange(false);
      setKey("");
      setDescription("");
      setIsActive(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create feature flag</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Flags allow you to safely roll out new features.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Flag key</label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. beta_feature_enabled"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Unique identifier used in your SDK. Use letters, numbers, and underscores.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this flag control?"
            />
          </div>

          <TooltipProvider>
            <div className="flex items-center gap-3 py-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="status-switch" className="text-sm font-semibold tracking-tight cursor-pointer">Enabled</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-md">
                    <p className="max-w-[200px] text-xs font-normal">
                      This flag will be <span className={cn("font-bold", isActive ? "text-green-600" : "text-red-500")}>
                        {isActive ? "ENABLED" : "DISABLED"}
                      </span> immediately after creation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                id="status-switch"
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </TooltipProvider>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <DialogFooter>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={submitting || !key.trim()}
              >
                {submitting ? "Creating..." : "Create flag"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
