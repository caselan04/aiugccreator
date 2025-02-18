
import { TabsTrigger } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { Brush, Home, UserCircle2, VideoIcon } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Link, useLocation } from "react-router-dom";

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-2 justify-between border-r border-neutral-200 h-screen p-4">
      <div className="flex flex-col gap-2">
        <Link to="/" className="flex items-center gap-2 px-4 py-2">
          <img src="/lovable-uploads/d4bf9c93-0da1-4ff0-a525-7d011be22596.png" alt="ShotPixelAi Logo" className="w-8 h-8 object-cover rounded-full" />
          <span className="text-xl font-semibold">ShotPixelAi</span>
        </Link>

        <Tabs orientation="vertical" defaultValue={location.pathname}>
          <TabsTrigger value="/" asChild>
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors",
                location.pathname === "/" && "bg-neutral-100"
              )}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="/hook-generator" asChild>
            <Link
              to="/hook-generator"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors",
                location.pathname === "/hook-generator" && "bg-neutral-100"
              )}
            >
              <Brush className="w-5 h-5" />
              <span>Hook Generator</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="/videos" asChild>
            <Link
              to="/videos"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors",
                location.pathname === "/videos" && "bg-neutral-100"
              )}
            >
              <VideoIcon className="w-5 h-5" />
              <span>Videos</span>
            </Link>
          </TabsTrigger>
        </Tabs>
      </div>

      <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
        <UserCircle2 className="w-5 h-5" />
        <span>Log in</span>
      </Link>
    </div>
  );
};

export default DashboardSidebar;
