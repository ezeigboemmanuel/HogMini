/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LogOut, User, PanelsTopLeft, Users as UsersIcon, ChartNoAxesColumn, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/app/contexts/AuthContext"
import logoImg from "@/components/icons/logo.png"
import { OrgSwitcher } from "./org-switcher"

function hashString(str?: string | null) {
  if (!str) return 0
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return h >>> 0
}

const PALETTE = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
]

function getColorForString(s?: string | null) {
  const hash = hashString(s || "")
  return PALETTE[hash % PALETTE.length]
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || ""
  const parts = source.trim().split(/\s+/)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function OrgSidebar({
  orgSlug,
  orgName,
  ...props
}: {
  orgSlug: string
  orgName: string
} & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const idForColor = React.useMemo(
    () => user?.id || user?.email || "anonymous",
    [user?.id, user?.email]
  )

  const navItems = [
    {
      title: "Projects",
      url: `/org/${orgSlug}/projects`,
      icon: PanelsTopLeft,
    },
    {
      title: "Users and permissions",
      url: `/org/${orgSlug}/members`,
      icon: UsersIcon,
    },
    {
      title: "Usage",
      url: `/org/${orgSlug}/usage`,
      icon: ChartNoAxesColumn,
    },
    {
      title: "Organization Settings",
      url: `/org/${orgSlug}/settings`,
      icon: Settings,
    },
  ]

  return (
    <Sidebar className="bg-white!" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logoImg} alt="HogMini" width={24} height={24} />
          </Link>
          <SidebarTrigger />
        </div>
        <OrgSwitcher currentOrgSlug={orgSlug} currentOrgName={orgName} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = (item as any).icon as React.ComponentType<any> | undefined
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} className="flex items-center gap-2">
                        {Icon ? <Icon className="h-4 w-4" /> : null}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <div className="flex items-center gap-2">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || user.email}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className={`size-8 inline-flex items-center justify-center text-sm font-medium text-white ${getColorForString(idForColor)} rounded-full shrink-0`}
                      >
                        {getInitials(user?.name, user?.email)}
                      </span>
                    )}
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm font-semibold truncate w-full">
                        {user?.name || user?.email}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" className="w-56">
                <div className="px-3 py-2">
                  <div className="font-semibold">{user?.name || user?.email}</div>
                  <div className="text-sm text-muted-foreground">{user?.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 size-4" /> Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 hover:text-red-500!"
                  onSelect={() => logout()}
                >
                  <LogOut className="mr-2 size-4 stroke-red-500" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
