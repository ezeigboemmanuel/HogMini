/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

type Props = {
  params: { projectId: string };
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = params;

  let project: any = null;
  try {
    const res = await fetch(withApi(`/projects/${projectId}`), {
      cache: "no-store",
      credentials: "include",
    });
    if (res.ok) project = await res.json();
  } catch (e) {
    // ignore - show fallback below
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl px-6 lg:px-16 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">{project.name}</h1>
          <p className="mt-2 text-sm text-gray-600">Project ID: {project.id}</p>
        </header>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium">Overview</h2>
          <p className="mt-3 text-sm text-gray-700">{project.description || "No description provided."}</p>
        </section>
      </div>
    </div>
  );
}
