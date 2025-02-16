
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UGCEditor from "@/components/dashboard/UGCEditor";
import { Routes, Route } from "react-router-dom";
import Videos from "@/pages/Videos";
import HookGenerator from "@/pages/HookGenerator";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 bg-neutral-100">
          <div className="p-6">
            <Routes>
              <Route index element={<UGCEditor />} />
              <Route path="videos" element={<Videos />} />
              <Route path="hook-generator" element={<HookGenerator />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
