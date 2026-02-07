"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function OrgHeader({
  orgName,
  orgDescription,
  orgSlug,
}: {
  orgName: string
  orgDescription?: string
  orgSlug: string
}) {
  const { open } = useSidebar()
  const pathname = usePathname()
  
  const isProjectsPage = pathname === `/org/${orgSlug}/projects`

  return (
    <header className="border-b bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!open && <SidebarTrigger />}
          {isProjectsPage ? (
            <h1 className="text-xl font-semibold">Projects</h1>
          ) : (
            <div>
              <h1 className="text-xl font-semibold">{orgName}</h1>
              {orgDescription && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {orgDescription}
                </p>
              )}
            </div>
          )}
        </div>
        {isProjectsPage && (
          <a
            href={`/org/${orgSlug}/projects/new`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            Create Project
          </a>
        )}
      </div>
    </header>
  )
}
