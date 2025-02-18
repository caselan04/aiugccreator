
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { UserRound, LineChart, CreditCard, LogOut, Rocket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const AccountContent = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setEmail(session.user.email || "");
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your account has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-5xl font-bold mb-16">Account</h1>
            
            <div className="space-y-8 max-w-xl">
              <div className="space-y-4">
                <label className="text-2xl font-medium block">
                  Email address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-lg px-6 py-4 h-auto rounded-full bg-white border-neutral-200"
                  placeholder="Enter your email"
                />
              </div>

              <Button 
                onPress={handleSave}
                className="bg-[#1A1F2C] text-white hover:bg-[#1A1F2C]/90 rounded-full px-12 py-6 h-auto text-lg font-medium"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Account = () => {
  return (
    <SidebarProvider>
      <AccountContent />
    </SidebarProvider>
  );
};

export default Account;
