
import { Button } from "@/components/ui/button";
import {
  Video,
  Settings,
  Menu,
  X,
  UserRound,
  HelpCircle,
  Wand2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarContext } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const location = useLocation();
  const { collapsed, setCollapsed, showMobileMenu, setShowMobileMenu } = useSidebarContext();

  const closeSidebar = () => {
    setCollapsed(true);
    setShowMobileMenu(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 w-[280px] bg-white z-30 transition-transform lg:transition-none duration-300 lg:translate-x-0",
          collapsed && !showMobileMenu && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full" />
              <span className="font-semibold">ShotPixelAi</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onPress={closeSidebar}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 border-r border-neutral-200">
            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      location.pathname === "/dashboard" && "bg-neutral-100"
                    )}
                  >
                    <Video className="w-5 h-5" />
                    Create UGC Video
                  </Button>
                </Link>
                <Link to="/hook-generator">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      location.pathname === "/hook-generator" && "bg-neutral-100"
                    )}
                  >
                    <Wand2 className="w-5 h-5" />
                    Hook Generator
                  </Button>
                </Link>
                <Link to="/videos">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      location.pathname === "/videos" && "bg-neutral-100"
                    )}
                  >
                    <Video className="w-5 h-5" />
                    My Videos
                  </Button>
                </Link>
              </div>
            </nav>

            {/* Bottom Navigation */}
            <div className="p-4 border-t border-neutral-200">
              <div className="space-y-2">
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      location.pathname === "/profile" && "bg-neutral-100"
                    )}
                  >
                    <UserRound className="w-5 h-5" />
                    Profile
                  </Button>
                </Link>
                <Link to="/support">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      location.pathname === "/support" && "bg-neutral-100"
                    )}
                  >
                    <HelpCircle className="w-5 h-5" />
                    Support
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      location.pathname === "/settings" && "bg-neutral-100"
                    )}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
