
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HookResult {
  id: number;
  hook: string;
  timestamp: string;
  description: string;
}

const HookGenerator = () => {
  const [productDescription, setProductDescription] = useState("");
  const [generatedHook, setGeneratedHook] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hookResults, setHookResults] = useState<HookResult[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
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

      const newHook: HookResult = {
        id: Date.now(),
        hook: data.hook,
        timestamp: new Date().toLocaleString(),
        description: productDescription,
      };

      setHookResults(prev => [newHook, ...prev]);
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

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied!",
        description: "Hook copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
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

            {hookResults.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold p-6 border-b">Generated Hooks History</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Hook</TableHead>
                      <TableHead>Time Generated</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hookResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="max-w-[200px] truncate">
                          {result.description}
                        </TableCell>
                        <TableCell>{result.hook}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {result.timestamp}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => copyToClipboard(result.hook, result.id)}
                          >
                            {copiedId === result.id ? (
                              <CheckCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HookGenerator;
