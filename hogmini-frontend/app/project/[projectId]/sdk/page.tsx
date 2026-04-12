import * as React from "react";
import SdkClient from "@/components/project/sdk-client";
import { withApi } from "@/lib/api";
import { cookies } from "next/headers";

type Props = {
  params: { projectId: string } | Promise<{ projectId: string }>;
};

async function getProject(projectId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(withApi(`/api/projects/${projectId}`), {
    headers: {
      Cookie: `token=${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch project details");
  }

  return res.json();
}

export default async function SdkPage({ params }: Props) {
  const resolvedParams = await params;
  const projectId = resolvedParams?.projectId ?? "";
  
  try {
    const project = await getProject(projectId);
    return (
      <div className="max-w-4xl">
        <SdkClient project={project} />
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-100">
        <h2 className="text-lg font-bold">Error</h2>
        <p>Could not load project SDK details. Please try again later.</p>
      </div>
    );
  }
}
