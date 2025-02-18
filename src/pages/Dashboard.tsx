
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UGCEditor from "@/components/dashboard/UGCEditor";
import { Settings, Menu, UserRound, LineChart, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarContext } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

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
              <Settings className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserRound className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2">
                    <UserRound className="w-4 h-4" />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/usage" className="flex items-center gap-2">
                    <LineChart className="w-4 h-4" />
                    <span>Usage</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/billing" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
