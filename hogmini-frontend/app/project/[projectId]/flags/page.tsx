/* eslint-disable @typescript-eslint/no-explicit-any */
import { withApi } from "@/lib/api";
import { FeatureFlagsTable } from "@/components/project/feature-flags-table";
import { AlertTriangle, Plus } from "lucide-react";

type Props = {
  params: { projectId: string } | Promise<{ projectId: string }>;
};

export default async function ProjectFlagsPage({ params }: Props) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.projectId ?? "";

  let project: any = null;
  try {
    const res = await fetch(withApi(`/api/projects/${projectId}`), {
      cache: "no-store",
      credentials: "include",
    });
    if (res.ok) project = await res.json();
  } catch (e) {
    console.log("Failed to fetch project details for page", e);
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl px-6 py-10">
          <h1 className="text-2xl font-semibold">Project not found</h1>
          <p className="mt-4 text-sm text-gray-600">No project found for id {projectId}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-310 px-4 lg:px-8">
        <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="self-center size-5 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-amber-900">SDK not connected</p>
                <p className="mt-1 text-sm text-amber-800">
                  Connect your SDK to start evaluating flags and see real-time data.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm cursor-pointer font-medium text-white shadow-sm hover:bg-black/90"
            >
              Connect SDK
            </button>
          </div>
        </section>

        <header className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Feature Flags</h1>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm cursor-pointer font-medium text-white shadow-sm hover:bg-black/90"
            >
              <Plus className="w-5 h-5 mr-1" />
              Create Flag
            </button>
          </div>
        </header>

        <FeatureFlagsTable />
      </div>
    </div>
  );
}