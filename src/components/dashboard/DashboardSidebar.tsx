
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoIcon, BookHeadphonesIcon, BookOpenIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  const { isCollapsed } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`border-r bg-white transition-all duration-300 ${
        isCollapsed ? "w-[80px]" : "w-[240px]"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-2 py-4">
        <div className="px-3 py-2">
          <TooltipProvider>
            <div className="space-y-1">
              <Link to="/dashboard">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <VideoIcon className="h-4 w-4 mr-2" />
                      {!isCollapsed && <span>Create Video</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      Create Video
                    </TooltipContent>
                  )}
                </Tooltip>
              </Link>
              <Link to="/dashboard/videos">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <BookOpenIcon className="h-4 w-4 mr-2" />
                      {!isCollapsed && <span>My Videos</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      My Videos
                    </TooltipContent>
                  )}
                </Tooltip>
              </Link>
              <Link to="/dashboard/hook-generator">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <BookHeadphonesIcon className="h-4 w-4 mr-2" />
                      {!isCollapsed && <span>Hook Generator</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      Hook Generator
                    </TooltipContent>
                  )}
                </Tooltip>
              </Link>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
