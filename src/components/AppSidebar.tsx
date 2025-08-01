import { useState } from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Settings, 
  Upload, 
  Rocket,
  PlusCircle,
  Building
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Sales Dashboard", url: "/dashboard/sales", icon: TrendingUp },
  { title: "Service Dashboard", url: "/dashboard/service", icon: Users },
  { title: "Admin Dashboard", url: "/dashboard/admin", icon: Settings },
];

const toolsItems = [
  { title: "Dashboard Builder", url: "/dashboard/builder", icon: PlusCircle },
  { title: "Data Upload", url: "/dashboard/data", icon: Upload },
  { title: "User Management", url: "/dashboard/users", icon: Users },
  { title: "Deployment Center", url: "/dashboard/deploy", icon: Rocket },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const isDashboardExpanded = mainItems.some((i) => isActive(i.url));
  const isToolsExpanded = toolsItems.some((i) => isActive(i.url));

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b p-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Chavan Hero</span>
          </div>
        )}
        {collapsed && (
          <Building className="h-6 w-6 text-primary mx-auto" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}