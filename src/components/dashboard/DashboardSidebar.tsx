
import { Home, Video, Calendar, BarChart, Settings, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Video, label: "Videos", path: "/dashboard/videos" },
  { icon: Calendar, label: "Schedule", path: "/dashboard/schedule" },
  { icon: BarChart, label: "Campaigns", path: "/dashboard/campaigns" },
];

const bottomMenuItems = [
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: HelpCircle, label: "Support", path: "/dashboard/support" },
];

const DashboardSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 mb-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">L</span>
            </div>
            <span className="text-xl font-semibold">Lovely</span>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomMenuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
