import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileTriggerButton } from "@/components/ui/file-trigger";
import { FileTrigger } from "react-aria-components";
import { Button } from "@/components/ui/button";

type HookPosition = 'top' | 'middle' | 'bottom';
type DemoVideo = {
  id: string;
  file_path: string;
  file_name: string;
  url?: string;
};

const UGCEditor = () => {
  const [hookText, setHookText] = useState("");
  const [hookPosition, setHookPosition] = useState<HookPosition>('top');
  const [selectedTab, setSelectedTab] = useState("Templates");
  const [currentPage, setCurrentPage] = useState(1);
  const [avatarVideos, setAvatarVideos] = useState<{ path: string; url: string }[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{ path: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
  const [selectedDemoVideo, setSelectedDemoVideo] = useState<DemoVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showingDemo, setShowingDemo] = useState(false);
  const { toast } = useToast();
  
  const itemsPerPage = 33;
  const totalPages = Math.ceil(avatarVideos.length / itemsPerPage);

  // Calculate current page videos
  const currentVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return avatarVideos.slice(startIndex, endIndex);
  }, [avatarVideos, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchAvatarVideos();
    fetchDemoVideos();
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
        },
        {
          path: 'replicate-prediction-52mc2b19chrma0cn07waf4krj8.mp4',
          url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-52mc2b19chrma0cn07waf4krj8.mp4'
        },
        {
          path: 'replicate-prediction-2hr8tajcpxrmc0cn0rcv9cvvy8.mp4',
          url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-2hr8tajcpxrmc0cn0rcv9cvvy8.mp4'
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

  const fetchDemoVideos = async () => {
    try {
      const { data: demos, error } = await supabase
        .from('demo_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const videosWithUrls = await Promise.all((demos || []).map(async (demo) => {
        const { data: { publicUrl } } = supabase.storage
          .from('demo_videos')
          .getPublicUrl(demo.file_path);
        
        return {
          ...demo,
          url: publicUrl
        };
      }));

      setDemoVideos(videosWithUrls);
    } catch (error) {
      console.error('Error fetching demo videos:', error);
      toast({
        title: "Error",
        description: "Failed to load demo videos",
        variant: "destructive"
      });
    }
  };

  const handleDemoUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('demo_videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase
        .from('demo_videos')
        .insert({
          file_path: filePath,
          file_name: file.name,
          content_type: file.type,
          size: file.size
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Demo video uploaded successfully"
      });

      // Refresh the demo videos list
      fetchDemoVideos();
    } catch (error) {
      console.error('Error uploading demo video:', error);
      toast({
        title: "Error",
        description: "Failed to upload demo video",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDemo = async () => {
    setSelectedDemoVideo(null);
  };

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
              <div className="space-y-4">
                <Textarea
                  className="min-h-[80px] bg-white border-transparent rounded-2xl text-center resize-none"
                  placeholder="edit ur text here"
                  value={hookText}
                  onChange={(e) => setHookText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  {(['top', 'middle', 'bottom'] as HookPosition[]).map((position) => (
                    <button
                      key={position}
                      className={`px-4 py-2 rounded-xl capitalize ${
                        hookPosition === position 
                          ? 'bg-primary text-white' 
                          : 'bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                      onClick={() => setHookPosition(position)}
                    >
                      {position}
                    </button>
                  ))}
                </div>
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
                <button 
                  className={`px-6 py-3 rounded-xl border flex items-center gap-2 hover:bg-neutral-50 transition-colors ${
                    !selectedDemoVideo ? 'bg-white border-primary' : 'bg-white border-neutral-200'
                  }`}
                  onClick={handleRemoveDemo}
                >
                  <X size={16} className="text-neutral-500" />
                  <span>None</span>
                </button>
                <FileTrigger
                  onSelect={(e) => {
                    if (!e) return;
                    const file = Array.from(e)[0];
                    if (file) {
                      handleDemoUpload({ target: { files: [file] } } as any);
                    }
                  }}
                >
                  <Button className="px-6 py-3 bg-white rounded-xl border border-neutral-200 flex items-center gap-2 hover:bg-neutral-50 transition-colors">
                    <Plus size={16} className="text-neutral-500" />
                    <span>{isUploading ? 'Uploading...' : 'Add Demo'}</span>
                  </Button>
                </FileTrigger>
              </div>
              {demoVideos.length > 0 && (
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {demoVideos.map((demo) => (
                    <button
                      key={demo.id}
                      className={`aspect-video rounded-xl bg-white hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all overflow-hidden ${
                        selectedDemoVideo?.id === demo.id ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      onClick={() => setSelectedDemoVideo(demo)}
                    >
                      <video 
                        src={demo.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        controls={false}
                        onEnded={(e) => {
                          if (selectedDemoVideo) {
                            e.currentTarget.classList.add('hidden');
                            const demoVideo = e.currentTarget.nextElementSibling as HTMLVideoElement;
                            demoVideo?.classList.remove('hidden');
                            demoVideo?.play();
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div className="aspect-[9/11] bg-neutral-200 rounded-3xl overflow-hidden flex items-center justify-center relative">
              {selectedVideo ? (
                <>
                  <video
                    key={selectedVideo.url}
                    src={selectedVideo.url}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    loop={!selectedDemoVideo}
                    playsInline
                    controls={false}
                    onEnded={(e) => {
                      if (selectedDemoVideo) {
                        setShowingDemo(true);
                        e.currentTarget.classList.add('hidden');
                        const demoVideo = e.currentTarget.nextElementSibling as HTMLVideoElement;
                        demoVideo?.classList.remove('hidden');
                        demoVideo?.play();
                      }
                    }}
                  />
                  {selectedDemoVideo && (
                    <video
                      key={selectedDemoVideo.url}
                      src={selectedDemoVideo.url}
                      className="w-full h-full object-contain hidden"
                      muted
                      playsInline
                      controls={false}
                      onEnded={(e) => {
                        setShowingDemo(false);
                        e.currentTarget.classList.add('hidden');
                        const mainVideo = e.currentTarget.previousElementSibling as HTMLVideoElement;
                        mainVideo?.classList.remove('hidden');
                        mainVideo?.play();
                      }}
                    />
                  )}
                  {hookText && !showingDemo && (
                    <div className={`absolute left-0 right-0 px-6 pointer-events-none ${
                      hookPosition === 'top' ? 'top-8' :
                      hookPosition === 'middle' ? 'top-1/2 -translate-y-1/2' :
                      'bottom-8'
                    }`}>
                      <div className="text-white text-2xl font-bold text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] whitespace-pre-wrap break-words max-w-full">
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
