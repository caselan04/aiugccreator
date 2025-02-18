
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UGCEditor from "@/components/dashboard/UGCEditor";
import { Settings, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1">
          {/* Top Navigation Bar */}
          <div className="h-16 border-b border-neutral-200 px-6 flex items-center justify-between bg-white">
            {/* Search Bar */}
            <div className="flex items-center gap-2 w-96">
              <Search className="w-5 h-5 text-neutral-500" />
              <Input 
                type="text" 
                placeholder="Search..." 
                className="border-0 focus-visible:ring-0 bg-neutral-50 w-full"
              />
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
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
    </SidebarProvider>
  );
};

export default Dashboard;
