
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UGCEditor from "@/components/dashboard/UGCEditor";
import { Settings, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarContext } from "@/components/ui/sidebar";

const DashboardContent = () => {
  const { setCollapsed, setShowMobileMenu } = useSidebarContext();

  const openMobileMenu = () => {
    setCollapsed(false);
    setShowMobileMenu(true);
  };

  return (
    <div className="min-h-screen flex w-full">
      <DashboardSidebar />
      <main className="flex-1">
        {/* Top Navigation Bar */}
        <div className="h-16 border-b border-neutral-200 px-6 flex items-center justify-between bg-white">
          <Button
            variant="ghost"
            size="icon"
            onPress={openMobileMenu}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Right section */}
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-neutral-200" />
          </div>
        </div>

        <div className="p-6 bg-white">
          <UGCEditor />
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default Dashboard;
