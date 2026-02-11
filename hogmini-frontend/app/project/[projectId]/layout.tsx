/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ProjectSidebar from "../../../components/project/project-sidebar"
import ProjectHeader from "../../../components/project/project-header"
import { withApi } from "@/lib/api"

type Props = {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

export default async function ProjectLayout({ children, params }: Props) {
  const resolvedParams = await params
  const projectId = resolvedParams.projectId

  let project: any = null
  try {
    const res = await fetch(withApi(`/api/projects/${projectId}`), {
      cache: "no-store",
      credentials: "include",
    })
    if (res.ok) project = await res.json()
  } catch (e) {
    console.log("Failed to fetch project details for layout", e)
  }

  return (
    <SidebarProvider>
      <ProjectSidebar projectId={projectId} />
      <SidebarInset>
        <div className="flex h-full w-full flex-col">
          <ProjectHeader
            projectName={project?.name}
            projectId={projectId}
            orgSlug={project?.organization?.slug ?? project?.orgSlug ?? project?.organizationSlug ?? null}
            orgName={project?.organization?.name ?? project?.orgName ?? null}
          />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
