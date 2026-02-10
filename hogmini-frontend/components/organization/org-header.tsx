"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { OrgSwitcher } from "./org-switcher";
import Link from "next/link";

export function OrgHeader({
  orgName,
  orgSlug,
}: {
  orgName: string;
  orgSlug: string;
}) {
  const { open } = useSidebar();

  return (
    <header className="border-b bg-background px-6 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!open && <SidebarTrigger />}
          <OrgSwitcher currentOrgSlug={orgSlug} currentOrgName={orgName} />
        </div>
        
        <Link href={`/docs`}>
          Docs
        </Link>
      </div>
    </header>
  );
}
