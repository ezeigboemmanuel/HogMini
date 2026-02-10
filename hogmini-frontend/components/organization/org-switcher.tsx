/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { OrgCreateDialog } from "./org-create-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Organization = {
  id: string;
  name: string;
  slug: string;
};

export function OrgSwitcher({
  currentOrgSlug,
  currentOrgName,
}: {
  currentOrgSlug: string;
  currentOrgName: string;
}) {
  const router = useRouter();
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await fetch("http://localhost:3001/organizations", {
          credentials: "include",
        });
        if (res.ok) {
          const orgs = await res.json();
          // Always include current org as a fallback and dedupe
          const combined =
            orgs && orgs.length > 0
              ? orgs
              : [
                  {
                    id: currentOrgSlug,
                    name: currentOrgName,
                    slug: currentOrgSlug,
                  },
                ];
          // Ensure current org present
          const hasCurrent = combined.some(
            (o: any) => o.slug === currentOrgSlug,
          );
          if (!hasCurrent)
            combined.unshift({
              id: currentOrgSlug,
              name: currentOrgName,
              slug: currentOrgSlug,
            });
          setOrganizations(combined);
        } else {
          // If fetch fails, at least show the current org
          setOrganizations([
            { id: currentOrgSlug, name: currentOrgName, slug: currentOrgSlug },
          ]);
        }
      } catch (e) {
        console.error("Failed to fetch organizations:", e);
        // If fetch fails, at least show the current org
        setOrganizations([
          { id: currentOrgSlug, name: currentOrgName, slug: currentOrgSlug },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizations();
  }, [currentOrgSlug, currentOrgName]);

  const handleOrgSwitch = (slug: string) => {
    router.push(`/org/${slug}/projects`);
  };

  const handleCreateOrg = () => {
    setOpen(true);
  };

  const onCreated = (org: Organization) => {
    // add to the top of list and navigate is handled by dialog
    setOrganizations((prev) => [
      org,
      ...prev.filter((o) => o.slug !== org.slug),
    ]);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <div className="flex items-center w-full">
            <button
              type="button"
              onClick={() => handleOrgSwitch(currentOrgSlug)}
              className="w-full text-left truncate h-full px-1.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150 text-sm cursor-pointer"
            >
              <span className="font-semibold">{currentOrgName}</span>
            </button>

            <div className="ml-0.5">
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open organization switcher"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer"
                >
                  <ChevronsUpDown className="w-5 h-5 stroke-gray-500" />
                </button>
              </DropdownMenuTrigger>
            </div>
          </div>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64"
            align="start"
          >
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
              Organizations
            </div>

            {loading ? (
              <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
            ) : (
              <>
                {/* Ensure the current org is always shown */}
                {(organizations.length > 0
                  ? organizations
                  : [
                      {
                        id: currentOrgSlug,
                        name: currentOrgName,
                        slug: currentOrgSlug,
                      },
                    ]
                ).map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onSelect={() => handleOrgSwitch(org.slug)}
                  >
                    <span className="pl-2">{org.name}</span>
                    {org.slug === currentOrgSlug && (
                      <Check className="ml-auto size-4" />
                    )}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleCreateOrg} className="cursor-pointer">
                  <Plus className=" size-4" />
                  Create Organization
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <OrgCreateDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={onCreated}
      />
    </SidebarMenu>
  );
}
