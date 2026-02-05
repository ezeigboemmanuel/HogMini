/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CreatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const validate = (name: string) => {
    if (!name.trim()) return "Project name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return null;
  };

  const handleCreate = async () => {
    const validationError = validate(projectName);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsCreating(true);

    try {
      const res = await fetch("http://localhost:3001/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: projectName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create organization");
      }

      const data = await res.json();
      toast.success("Project created");
      setProjectName("");
      // Navigate to new project's page
      if (data?.id) router.push(`/projects/${data.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl px-6 lg:px-16 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Create a project
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a project to manage feature flags, environments and invite
            collaborators.
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-700"
            >
              Project name
            </label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Acme Project"
              className="mt-2"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex w-full justify-end items-center gap-4">
            <Button
              type="submit"
              disabled={isCreating || !!error || !projectName.trim()}
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            After creating a project you can configure environments, add feature
            flags, and invite collaborators.
          </p>
        </form>
      </div>
    </div>
  );
}
