import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UGCEditor from "@/components/dashboard/UGCEditor";
const Dashboard = () => {
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 bg-neutral-100">
          <div className="p-6 bg-slate-200 hover:bg-slate-100">
            <UGCEditor />
          </div>
        </main>
      </div>
    </SidebarProvider>;
};
export default Dashboard;