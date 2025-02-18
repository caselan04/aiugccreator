
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Account = () => {
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
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
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
  );
};

export default Account;
