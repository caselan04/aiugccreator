
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UGCEditor from "@/components/dashboard/UGCEditor";
import { UserRound, LineChart, CreditCard, LogOut, Rocket } from "lucide-react";
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

  return (
    <div className="min-h-screen flex w-full">
      <DashboardSidebar />
      <main className="flex-1">
        {/* Top Navigation Bar */}
        <div className="h-16 border-b border-neutral-200 px-6 flex items-center justify-between bg-white">
          {/* Right section */}
          <div className="flex items-center gap-4 ml-auto">
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Upgrade
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
                  <UserRound className="w-5 h-5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white">
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
