/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { OrgSidebar } from "../../../components/organization/org-sidebar"
import { OrgHeader } from "../../../components/organization/org-header"

type Props = {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}

export default async function OrgLayout({ children, params }: Props) {
  const resolvedParams = await params
  const orgSlug = resolvedParams.orgSlug

  let org: any = null
  try {
    const res = await fetch(`http://localhost:3001/organizations/${orgSlug}`, {
      cache: "no-store",
      credentials: "include",
    })
    if (res.ok) org = await res.json()
  } catch (e) {
    // ignore
  }

  return (
    <SidebarProvider>
      <OrgSidebar orgSlug={orgSlug} orgName={org?.name ?? orgSlug} />
      <SidebarInset>
        <div className="flex h-full w-full flex-col">
          <OrgHeader 
            orgName={org?.name ?? orgSlug}
            orgDescription={org?.description}
            orgSlug={orgSlug}
          />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}