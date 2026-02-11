/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

export default function CreateProjectDialog({
  open,
  onOpenChange,
  orgSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return setError("Please provide a project name");
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(withApi(`/api/organizations/${orgSlug}/projects`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error(`Failed to create project (${res.status})`);
      const project = await res.json();
      onOpenChange(false);
      // Navigate to the new project page if an id is returned
      if (project?.id) {
        router.push(`/project/${project.id}`);
      } else {
        // fallback: refresh the current page
        router.refresh();
      }
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
          <DialogTitle>Create project</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            A short, descriptive name to identify this project.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My project"
            />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <DialogFooter>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || !name.trim()}
              >
                {submitting ? "Creating..." : "Create project"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
