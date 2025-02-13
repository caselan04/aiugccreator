
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

const UGCEditor = () => {
  const [hookText, setHookText] = useState("");

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Create UGC ads</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">1. Hook</h2>
          <div className="relative">
            <ChevronLeft className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 pr-10"
              placeholder="edit ur text here"
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
            />
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">2. AI avatar</h2>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-100"></div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">3. Demos</h2>
          <div className="flex gap-4">
            <button className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              None
            </button>
            <button className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              Add Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UGCEditor;
