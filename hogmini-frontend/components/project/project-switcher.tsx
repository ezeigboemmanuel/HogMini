/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { withApi } from "@/lib/api";
import CreateProjectDialog from "@/components/organization/create-project-dialog";

export function ProjectSwitcher({
  currentProjectId,
  currentProjectName,
  orgSlug,
}: {
  currentProjectId: string;
  currentProjectName?: string;
  orgSlug?: string | null;
}) {
  const router = useRouter();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [localOrgSlug, setLocalOrgSlug] = React.useState<string | null>(orgSlug ?? null);

  React.useEffect(() => {
    let mounted = true
    async function resolveAndFetch() {
      setLoading(true)
      try {
        let slug = orgSlug ?? localOrgSlug

        // If we don't have an org slug, try to derive it from the current project id
        if (!slug && currentProjectId) {
          try {
            const pr = await fetch(withApi(`/api/projects/${currentProjectId}`), { credentials: "include" })
            if (pr.ok) {
              const pdata = await pr.json()
              slug = pdata?.organization?.slug ?? pdata?.orgSlug ?? pdata?.organizationSlug ?? null
              if (slug && mounted) setLocalOrgSlug(slug)
            }
          } catch (e) {
            console.error("Failed to fetch project to derive org slug:", e)
          }
        }

        if (!slug) {
          setProjects([])
          return
        }

        const res = await fetch(withApi(`/api/organizations/${slug}/projects`), {
          credentials: "include",
        })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setProjects(data || [])
        } else {
          setProjects([])
        }
      } catch (e) {
        console.error("Failed to fetch projects:", e)
        setProjects([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    resolveAndFetch()

    return () => {
      mounted = false
    }
  }, [orgSlug, currentProjectId, localOrgSlug])

  const handleProjectSwitch = (id?: string) => {
    if (!id) return
    router.push(`/project/${id}/flags`);
  };

  const handleCreateProject = () => setOpen(true);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <div className="flex items-center w-full">
            <button
              type="button"
              onClick={() => handleProjectSwitch(currentProjectId)}
              className="w-full text-left h-full px-1.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150 text-sm cursor-pointer"
            >
              <span className="font-semibold whitespace-nowrap">{currentProjectName}</span>
            </button>

            <div className="ml-0.5">
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open project switcher"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
                >
                  <ChevronsUpDown className="w-5 h-5 stroke-gray-500" />
                </button>
              </DropdownMenuTrigger>
            </div>
          </div>

          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-64" align="start">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Projects</div>

            {loading ? (
              <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
            ) : !orgSlug ? (
              <DropdownMenuItem disabled>No organization selected</DropdownMenuItem>
            ) : (
              <>
                {(projects.length > 0 ? projects : []).map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => handleProjectSwitch(p.id)}>
                    <span className="pl-2">{p.name}</span>
                    {p.id === currentProjectId && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleCreateProject} className="cursor-pointer">
                  <Plus className="size-4" />
                  Create Project
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {orgSlug ? (
        <CreateProjectDialog open={open} onOpenChange={setOpen} orgSlug={orgSlug} />
      ) : null}
    </SidebarMenu>
  );
}

export default ProjectSwitcher;
