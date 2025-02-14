
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
  const [selectedVideo, setSelectedVideo] = useState<{ path: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 33;
  const totalPages = Math.ceil(avatarVideos.length / itemsPerPage);

  useEffect(() => {
    fetchAvatarVideos();
  }, []);

  const fetchAvatarVideos = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching videos from Supabase storage...');
      
      // Known working videos
      const knownVideos = [
        {
          path: 'replicate-prediction-tp3rf54qrdrmc0cn041rnm125r.mp4',
          url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-tp3rf54qrdrmc0cn041rnm125r.mp4'
        },
        {
          path: 'replicate-prediction-pv8ttqx551rm80cmvj7rfee9q8.mp4',
          url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-pv8ttqx551rm80cmvj7rfee9q8.mp4'
        }
      ];
      
      const { data: files, error } = await supabase.storage.from('aiugcavatars').list();
      
      if (error) {
        console.error('Error fetching videos:', error);
        setAvatarVideos(knownVideos);
        return;
      }

      console.log('Found files:', files);

      if (!files || files.length === 0) {
        console.log('No files found in the bucket, using known videos');
        setAvatarVideos(knownVideos);
        return;
      }

      // Create signed URLs for each video
      const videosWithUrls = await Promise.all(
        files
          .filter(file => !file.name.startsWith('.'))
          .map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('aiugcavatars')
              .getPublicUrl(file.name);
            
            console.log(`Generated URL for ${file.name}:`, publicUrl);
            
            return {
              path: file.name,
              url: publicUrl
            };
          })
      );

      console.log('Processed videos:', videosWithUrls);
      const allVideos = [
        ...knownVideos,
        ...videosWithUrls.filter(v => !knownVideos.some(kv => kv.path === v.path))
      ];
      setAvatarVideos(allVideos);
    } catch (error) {
      console.error('Error processing videos:', error);
    } finally {
      setIsLoading(false);
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
                {isLoading ? (
                  <div className="col-span-11 text-center py-8 text-neutral-500">
                    Loading videos...
                  </div>
                ) : avatarVideos.length === 0 ? (
                  <div className="col-span-11 text-center py-8 text-neutral-500">
                    No videos found in storage
                  </div>
                ) : (
                  currentVideos.map((video, index) => (
                    <button
                      key={index}
                      className={`aspect-square rounded-xl bg-white hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all overflow-hidden ${
                        selectedVideo?.path === video.path ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <video 
                        src={video.url}
                        className="w-full h-full object-cover rounded-xl"
                        preload="metadata"
                        muted
                        loop
                        playsInline
                        controls={false}
                        onError={(e) => console.error('Video loading error:', e)}
                        onLoadStart={() => console.log('Video loading started:', video.url)}
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    </button>
                  ))
                )}
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
            <div className="aspect-[9/11] bg-neutral-200 rounded-3xl overflow-hidden flex items-center justify-center relative">
              {selectedVideo ? (
                <>
                  <video
                    src={selectedVideo.url}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                  />
                  {hookText && (
                    <div className="absolute top-8 left-0 right-0 px-6 pointer-events-none">
                      <div className="text-white text-2xl font-bold text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                        {hookText}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                  Select an AI avatar to preview
                </div>
              )}
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
