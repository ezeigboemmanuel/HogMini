"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import ProjectSwitcher from "./project-switcher";
import { OrgSwitcher } from "@/components/organization/org-switcher";
import Link from "next/link";
import * as React from "react";
import { withApi } from "@/lib/api";

export function ProjectHeader({
  projectName,
  projectId,
  orgSlug,
  orgName,
}: {
  projectName?: string;
  projectId?: string;
  orgSlug?: string | null;
  orgName?: string | null;
}) {
  const { open, isMobile } = useSidebar();
  const [localOrgSlug, setLocalOrgSlug] = React.useState<string | null>(
    orgSlug ?? null,
  );
  const [localOrgName, setLocalOrgName] = React.useState<string | null>(
    orgName ?? null,
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if ((!localOrgSlug || !localOrgName) && projectId) {
      let mounted = true;
      setLoading(true);
      (async () => {
        try {
          const res = await fetch(withApi(`/api/projects/${projectId}`), {
            credentials: "include",
          });
          if (!res.ok) return;
          const p = await res.json();
          if (!mounted) return;
          const s =
            p?.organization?.slug ?? p?.orgSlug ?? p?.organizationSlug ?? null;
          const n = p?.organization?.name ?? p?.orgName ?? null;
          if (s) setLocalOrgSlug(s);
          if (n) setLocalOrgName(n);
        } catch (e) {
          console.log("Failed to fetch project to derive org details:", e);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }
  }, [projectId, localOrgName, localOrgSlug]);

  return (
    <header className="border-b bg-background px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(!open || isMobile) && <SidebarTrigger />}
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse" />
              <span className="text-gray-500">/</span>
              <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse" />
            </div>
          ) : (
            <>
              <OrgSwitcher
                currentOrgSlug={localOrgSlug ?? ""}
                currentOrgName={localOrgName ?? ""}
              />
              <span className="text-gray-500">/</span>
              <ProjectSwitcher
                currentProjectId={projectId || ""}
                currentProjectName={projectName || ""}
                orgSlug={localOrgSlug ?? null}
              />
            </>
          )}
        </div>

        <Link href={`/docs`}>Docs</Link>
      </div>
    </header>
  );
}

export default ProjectHeader;
