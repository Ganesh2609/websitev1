import * as React from "react"
import { Command, Home } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// Simplified data with only "Home" and "CarePlus"
const data = {
  teams: [
    {
      name: "CarePlus",
      logo: Command,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
    },
  ],
  navSecondary: [],
  favorites: [],
  workspaces: [],
}

export function HomeSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        {/* Other sections are left empty or removed if not needed */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
