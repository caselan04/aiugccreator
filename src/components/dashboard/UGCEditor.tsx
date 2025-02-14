
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const UGCEditor = () => {
  const [hookText, setHookText] = useState("");
  const [selectedTab, setSelectedTab] = useState("Templates");
  const [currentPage, setCurrentPage] = useState(1);
  const [avatarVideos, setAvatarVideos] = useState<{ path: string; url: string }[]>([]);
  const itemsPerPage = 33;
  const totalPages = Math.ceil(avatarVideos.length / itemsPerPage);

  useEffect(() => {
    fetchAvatarVideos();
  }, []);

  const fetchAvatarVideos = async () => {
    try {
      const { data, error } = await supabase.storage.from('aiugcavatars').list();
      
      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }

      // Create signed URLs for each video
      const videosWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('aiugcavatars')
            .getPublicUrl(file.name);
          
          return {
            path: file.name,
            url: publicUrl
          };
        })
      );

      setAvatarVideos(videosWithUrls);
    } catch (error) {
      console.error('Error processing videos:', error);
    }
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = avatarVideos.slice(startIndex, endIndex);

  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Create UGC ads</h1>
      
      <div className="bg-neutral-100 rounded-2xl p-8 min-h-[600px]">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Hook Section */}
            <div>
              <h2 className="text-base font-medium mb-4 text-neutral-800">1. Hook</h2>
              <div className="relative">
                <button 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  onClick={() => console.log("Previous hook")}
                >
                  <ChevronLeft size={20} />
                </button>
                <Input
                  className="pl-10 pr-10 h-12 bg-white border-transparent rounded-2xl text-center"
                  placeholder="edit ur text here"
                  value={hookText}
                  onChange={(e) => setHookText(e.target.value)}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  onClick={() => console.log("Next hook")}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* AI Avatar Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-neutral-800">2. AI avatar</h2>
                <div className="flex items-center gap-4 text-sm">
                  <button 
                    className={`${selectedTab === "Templates" ? "text-neutral-900" : "text-neutral-500"}`}
                    onClick={() => setSelectedTab("Templates")}
                  >
                    Templates
                  </button>
                  <button 
                    className={`${selectedTab === "My UGC" ? "text-neutral-900" : "text-neutral-500"}`}
                    onClick={() => setSelectedTab("My UGC")}
                  >
                    My UGC
                  </button>
                  <div className="flex items-center gap-1 text-neutral-500">
                    <button 
                      className="hover:text-neutral-700"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span>{currentPage}/{Math.max(1, totalPages)}</span>
                    <button 
                      className="hover:text-neutral-700"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-11 gap-2">
                {currentVideos.map((video, index) => (
                  <button
                    key={index}
                    className="aspect-square rounded-xl bg-white hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all overflow-hidden"
                  >
                    <video 
                      src={video.url}
                      className="w-full h-full object-cover rounded-xl"
                      preload="metadata"
                      muted
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Demos Section */}
            <div>
              <h2 className="text-base font-medium mb-4 text-neutral-800">3. Demos</h2>
              <div className="flex gap-2">
                <button className="px-6 py-3 bg-white rounded-xl border border-primary flex items-center gap-2 hover:bg-neutral-50 transition-colors">
                  <X size={16} className="text-neutral-500" />
                  <span>None</span>
                </button>
                <button className="px-6 py-3 bg-white rounded-xl border border-neutral-200 flex items-center gap-2 hover:bg-neutral-50 transition-colors">
                  <Plus size={16} className="text-neutral-500" />
                  <span>Add Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div className="aspect-[9/11] bg-neutral-200 rounded-3xl overflow-hidden">
              {/* Video preview would go here */}
            </div>
            <div className="flex items-center gap-2 bg-neutral-200 rounded-xl p-4">
              <div className="w-8 h-8 bg-neutral-300 rounded-lg"></div>
              <span className="text-neutral-500 flex-1">Sound</span>
              <span className="text-neutral-500">Subscription required to use</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UGCEditor;
