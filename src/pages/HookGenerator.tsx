
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const HookGenerator = () => {
  const [productDescription, setProductDescription] = useState("");
  const [generatedHook, setGeneratedHook] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateHook = async () => {
    if (!productDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-hook', {
        body: { prompt: productDescription }
      });

      if (error) {
        throw error;
      }

      setGeneratedHook(data.hook);
      toast({
        title: "Success",
        description: "Hook generated successfully!",
      });
    } catch (error) {
      console.error('Error generating hook:', error);
      toast({
        title: "Error",
        description: "Failed to generate hook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 bg-neutral-100">
          <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Hook Generator</h1>
            <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Describe your product or service
                </label>
                <Textarea
                  placeholder="Enter details about your product or service..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-sm text-muted-foreground">
                  Be specific and include key features, benefits, and target audience.
                </p>
              </div>

              <Button
                onPress={generateHook}
                isDisabled={isLoading || !productDescription.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Hook...
                  </>
                ) : (
                  "Generate Hook"
                )}
              </Button>

              {generatedHook && (
                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium">Generated Hook</label>
                  <div className="p-4 bg-neutral-50 rounded-lg border">
                    <p className="text-sm">{generatedHook}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HookGenerator;
