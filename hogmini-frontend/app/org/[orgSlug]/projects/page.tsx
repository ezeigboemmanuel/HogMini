/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ProjectsClient from "@/components/organization/projects-client";

type Props = {
  params: { orgSlug: string } | Promise<{ orgSlug: string }>;
};

export default async function OrgProjectsPage({ params }: Props) {
  const resolvedParams = await params;
  const orgSlug = resolvedParams?.orgSlug ?? "";

  let projects: Project[] = [];

  try {
    const res = await fetch(
      `http://localhost:3001/organizations/${orgSlug}/projects`,
      {
        cache: "no-store",
        credentials: "include",
      },
    );
    if (res.ok) projects = await res.json();
  } catch (e) {
    // ignore
  }

  return <ProjectsClient orgSlug={orgSlug} projects={projects} />
}
