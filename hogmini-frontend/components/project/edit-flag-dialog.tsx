"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { withApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import { useProject } from "@/app/contexts/ProjectContext";

const formSchema = z.object({
  key: z.string().min(1, "Key is required").regex(/^[a-zA-Z0-9_-]+$/, "Only alphanumeric, underscores and dashes allowed"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  flag: {
    id: string;
    key: string;
    description?: string;
    isActive: boolean;
  } | null;
  onSuccess?: () => void;
}

export default function EditFlagDialog({
  open,
  onOpenChange,
  projectId,
  flag,
  onSuccess,
}: EditFlagDialogProps) {
  const { selectedEnvironment } = useProject();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open && flag) {
      form.reset({
        key: flag.key,
        description: flag.description || "",
        isActive: flag.isActive,
      });
    }
  }, [open, flag?.id, form]);

  async function onSubmit(values: FormValues) {
    if (!flag) return;
    setSubmitting(true);
    try {
      const response = await fetch(withApi(`/api/projects/${projectId}/flags/${flag.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          environmentId: selectedEnvironment?.id
        }),
      });

      if (response.ok) {
        toast.success("Feature flag updated successfully");
        onOpenChange(false);
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update feature flag");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Feature Flag</DialogTitle>
          <DialogDescription>
            Update the details for this feature flag.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flag Key</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. beta-feature" {...field} title="Changing the key will break SDK integrations using the old key" />
                  </FormControl>
                  {field.value !== flag?.key && (

                    <p className="text-xs leading-tight ml-2 text-red-500">
                      Warning! Changing the key will break apps using the old key. Use with caution.
                    </p>

                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="What does this flag control?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        This flag will be <span className={cn("font-bold", form.watch("isActive") ? "text-green-600" : "text-red-500")}>
                          {form.watch("isActive") ? "ENABLED" : "DISABLED"}
                        </span>.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          id="status-switch"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-green-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </TooltipProvider>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
