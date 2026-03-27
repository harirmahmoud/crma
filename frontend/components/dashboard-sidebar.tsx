"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  UserIcon,
  SettingsIcon,
  HomeIcon,
  UsersIcon,
  UserCheckIcon,
  HeartHandshakeIcon,
  ShieldIcon,
  FileSignatureIcon,
  BuildingIcon,
  FileIcon,
  FolderOpenIcon
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"

const navGroups = [
  {
    title: "Général",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: UserIcon,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: SettingsIcon,
      },
    ]
  },
  {
    title: "Personnes",
    items: [
      {
        title: "Assuré",
        href: "/dashboard/assure",
        icon: UsersIcon,
      },
      {
        title: "Adhérent",
        href: "/dashboard/adherant",
        icon: UserCheckIcon,
      },
      {
        title: "Bénéficiaire",
        href: "/dashboard/beneficiaire",
        icon: HeartHandshakeIcon,
      },
    ]
  },
  {
    title: "Gestion",
    items: [
      {
        title: "Franchise",
        href: "/dashboard/franchise",
        icon: ShieldIcon,
      },
      {
        title: "Condition",
        href: "/dashboard/condition",
        icon: FileSignatureIcon,
      },
      {
        title: "GrpFranchise",
        href: "/dashboard/grpfranchise",
        icon: BuildingIcon,
      },
    ]
  },
  {
    title: "Dossiers",
    items: [
      {
        title: "Pièce",
        href: "/dashboard/piece",
        icon: FileIcon,
      },
      {
        title: "Cas",
        href: "/dashboard/cas",
        icon: FolderOpenIcon,
      },
    ]
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <HomeIcon className="size-4" />
          </div>
          <span className="text-lg font-semibold">Dashboard</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  )
}
