import ProjectsClient from "@/components/organization/projects-client";
import { withApi } from "@/lib/api";

type Props = {
  params: { orgSlug: string } | Promise<{ orgSlug: string }>;
};

export default async function OrgProjectsPage({ params }: Props) {
  const resolvedParams = await params;
  const orgSlug = resolvedParams?.orgSlug ?? "";

  let projects: Project[] = [];

  try {
    const res = await fetch(
      withApi(`/api/organizations/${orgSlug}/projects`),
      {
        cache: "no-store",
        credentials: "include",
      },
    );
    if (res.ok) projects = await res.json();
  } catch (e) {
    console.log("Failed to fetch projects for org", orgSlug, e);
  }

  return <ProjectsClient orgSlug={orgSlug} projects={projects} />
}
