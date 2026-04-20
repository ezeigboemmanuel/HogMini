import ProjectsClient from "@/components/organization/projects-client";
import { withApi } from "@/lib/api";
import { cookies } from "next/headers";

type Props = {
  params: { orgSlug: string } | Promise<{ orgSlug: string }>;
};

export default async function OrgProjectsPage({ params }: Props) {
  const resolvedParams = await params;
  const orgSlug = resolvedParams?.orgSlug ?? "";

  let projects: Project[] = [];

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(
      withApi(`/api/organizations/${orgSlug}/projects`),
      {
        cache: "no-store",
        headers: {
          Cookie: `token=${token}`,
        },
      },
    );
    if (res.ok) projects = await res.json();
  } catch (e) {
    console.log("Failed to fetch projects for org", orgSlug, e);
  }

  return <ProjectsClient orgSlug={orgSlug} projects={projects} />
}
