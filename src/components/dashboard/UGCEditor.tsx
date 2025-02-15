import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, X, Plus, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileTrigger } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type HookPosition = 'top' | 'middle' | 'bottom';
type FontOption = 'sans' | 'serif' | 'mono';
type DemoVideo = {
  id: string;
  file_path: string;
  file_name: string;
  url?: string;
  user_id?: string;
};

const UGCEditor = () => {
  const navigate = useNavigate();
  const [hookText, setHookText] = useState("");
  const [hookPosition, setHookPosition] = useState<HookPosition>('top');
  const [selectedFont, setSelectedFont] = useState<FontOption>('sans');
  const [selectedTab, setSelectedTab] = useState("Templates");
  const [currentPage, setCurrentPage] = useState(1);
  const [avatarVideos, setAvatarVideos] = useState<{
    path: string;
    url: string;
  }[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{
    path: string;
    url: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
  const [selectedDemoVideo, setSelectedDemoVideo] = useState<DemoVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showingDemo, setShowingDemo] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const { toast } = useToast();
  const ffmpeg = useMemo(() => new FFmpeg(), []);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        if (!ffmpeg.loaded) {
          setProcessingStep('Loading FFmpeg...');
          await ffmpeg.load();
          console.log('FFmpeg loaded successfully');
        }
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
        toast({
          title: "Error",
          description: "Failed to initialize video processor",
          variant: "destructive"
        });
      }
    };

    loadFFmpeg();
  }, [ffmpeg]);

  useEffect(() => {
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg Log:', message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      console.log('FFmpeg Progress:', progress);
      setProgress(progress * 100);
    });
  }, [ffmpeg]);

  const itemsPerPage = 33;
  const totalPages = Math.ceil(avatarVideos.length / itemsPerPage);

  const currentVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return avatarVideos.slice(startIndex, endIndex);
  }, [avatarVideos, currentPage, itemsPerPage]);

  useEffect(() => {
    checkAuth();
    fetchAvatarVideos();
    fetchDemoVideos();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this feature",
        variant: "destructive"
      });
      navigate("/auth");
    }
  };

  const fetchAvatarVideos = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching videos from Supabase storage...');
      const knownVideos = [{
        path: 'replicate-prediction-tp3rf54qrdrmc0cn041rnm125r.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-tp3rf54qrdrmc0cn041rnm125r.mp4'
      }, {
        path: 'replicate-prediction-pv8ttqx551rm80cmvj7rfee9q8.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-pv8ttqx551rm80cmvj7rfee9q8.mp4'
      }, {
        path: 'replicate-prediction-52mc2b19chrma0cn07waf4krj8.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-52mc2b19chrma0cn07waf4krj8.mp4'
      }, {
        path: 'replicate-prediction-2hr8tajcpxrmc0cn0rcv9cvvy8.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-2hr8tajcpxrmc0cn0rcv9cvvy8.mp4'
      }, {
        path: 'replicate-prediction-1p8v7wpt0srmc0cn1dqb49xmt0.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-1p8v7wpt0srmc0cn1dqb49xmt0.mp4'
      }, {
        path: 'replicate-prediction-byq6ey50rdrmc0cn1e1rq73y7m.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-byq6ey50rdrmc0cn1e1rq73y7m.mp4'
      }, {
        path: 'replicate-prediction-n6j4e9dmq5rme0cn1e4sa15nmc.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-n6j4e9dmq5rme0cn1e4sa15nmc.mp4'
      }, {
        path: 'replicate-prediction-pxdhdts9bdrm80cn1era8xt3m4.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-pxdhdts9bdrm80cn1era8xt3m4.mp4'
      }, {
        path: 'replicate-prediction-cxbppzzxhxrma0cn1f1vk2w2mg.mp4',
        url: 'https://pkcbkbtfwgoghldrdvfi.supabase.co/storage/v1/object/public/aiugcavatars//replicate-prediction-cxbppzzxhxrma0cn1f1vk2w2mg.mp4'
      }];

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

      const videosWithUrls = await Promise.all(
        files
          .filter(file => !file.name.startsWith('.'))
          .map(async file => {
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
      const allVideos = [...knownVideos, ...videosWithUrls.filter(v => !knownVideos.some(kv => kv.path === v.path))];
      setAvatarVideos(allVideos);
    } catch (error) {
      console.error('Error processing videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDemoVideos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: demos, error } = await supabase
        .from('demo_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const videosWithUrls = await Promise.all((demos || []).map(async demo => {
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
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload videos",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('demo_videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('demo_videos')
        .insert({
          file_path: filePath,
          file_name: file.name,
          content_type: file.type,
          size: file.size,
          user_id: session.user.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Demo video uploaded successfully"
      });
      
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

  const handleDeleteDemo = async (demo: DemoVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to delete videos",
          variant: "destructive"
        });
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('demo_videos')
        .remove([demo.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('demo_videos')
        .delete()
        .eq('id', demo.id);

      if (dbError) throw dbError;

      // Update UI
      if (selectedDemoVideo?.id === demo.id) {
        setSelectedDemoVideo(null);
      }
      setDemoVideos(demoVideos.filter(v => v.id !== demo.id));
      
      toast({
        title: "Success",
        description: "Demo video deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting demo video:', error);
      toast({
        title: "Error",
        description: "Failed to delete demo video",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getFontClass = (font: FontOption) => {
    switch (font) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  const handleGenerateVideo = async () => {
    try {
      if (!selectedVideo) {
        toast({
          title: "Error",
          description: "Please select an AI avatar first",
          variant: "destructive"
        });
        return;
      }

      if (!hookText) {
        toast({
          title: "Error",
          description: "Please enter hook text first",
          variant: "destructive"
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate videos",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      setIsProcessing(true);
      setProcessingStep('Initializing...');

      const { data: video, error } = await supabase
        .from('videos')
        .insert({
          title: hookText.substring(0, 50),
          hook_text: hookText,
          avatar_video_path: selectedVideo.path,
          font_style: selectedFont,
          hook_position: hookPosition,
          file_name: selectedVideo.path,
          file_path: selectedVideo.path,
          user_id: session.user.id,
          status: 'processing',
          demo_video_path: selectedDemoVideo?.file_path
        })
        .select()
        .single();

      if (error) throw error;

      // Ensure FFmpeg is loaded
      if (!ffmpeg.loaded) {
        setProcessingStep('Loading FFmpeg...');
        await ffmpeg.load();
      }

      // Download and process avatar video
      setProcessingStep('Processing avatar video...');
      console.log('Downloading avatar video:', selectedVideo.url);
      const avatarResponse = await fetch(selectedVideo.url);
      const avatarBlob = await avatarResponse.blob();
      const avatarBuffer = await fetchFile(avatarBlob);

      await ffmpeg.writeFile('input.mp4', avatarBuffer);
      console.log('Avatar video written to FFmpeg');

      // Add text overlay
      setProcessingStep('Adding text overlay...');
      const yPosition = hookPosition === 'top' ? '50' : 
                       hookPosition === 'middle' ? '(h/2)' : 
                       'h-60';

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `drawtext=text='${hookText}':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=${yPosition}`,
        '-c:a', 'copy',
        'output.mp4'
      ]);
      console.log('Text overlay completed');

      let finalVideoPath = 'output.mp4';

      // Handle demo video if present
      if (selectedDemoVideo) {
        setProcessingStep('Processing demo video...');
        console.log('Downloading demo video:', selectedDemoVideo.url);
        const demoResponse = await fetch(selectedDemoVideo.url!);
        const demoBlob = await demoResponse.blob();
        const demoBuffer = await fetchFile(demoBlob);

        await ffmpeg.writeFile('demo.mp4', demoBuffer);
        
        // Create concatenation list
        const concatContent = 'file output.mp4\nfile demo.mp4';
        await ffmpeg.writeFile('concat.txt', concatContent);

        setProcessingStep('Merging videos...');
        await ffmpeg.exec([
          '-f', 'concat',
          '-safe', '0',
          '-i', 'concat.txt',
          '-c', 'copy',
          'final.mp4'
        ]);
        console.log('Videos merged successfully');
        
        finalVideoPath = 'final.mp4';
      }

      // Read the processed video
      setProcessingStep('Preparing final video...');
      const processedData = await ffmpeg.readFile(finalVideoPath);
      const finalBlob = new Blob([processedData], { type: 'video/mp4' });
      console.log('Final video size:', finalBlob.size);

      // Upload to Supabase
      setProcessingStep('Uploading to storage...');
      const finalFileName = `${crypto.randomUUID()}.mp4`;
      const { error: uploadError } = await supabase.storage
        .from('aiugcavatars')
        .upload(finalFileName, finalBlob);

      if (uploadError) throw uploadError;

      // Update video record
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          combined_video_path: finalFileName,
          status: 'completed'
        })
        .eq('id', video.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Video generated successfully! View it in My Videos.",
      });

      navigate("/videos");
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate video",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessingStep('');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Create UGC ads</h1>
      <div className="bg-neutral-100 rounded-2xl p-8 min-h-[600px]">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-base font-medium mb-4 text-neutral-800">1. Text</h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-center mb-2">
                  <Select value={selectedFont} onValueChange={value => setSelectedFont(value as FontOption)}>
                    <SelectTrigger className="w-[180px] bg-white">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans">Sans-serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea className={`min-h-[80px] bg-white border-transparent rounded-2xl text-center resize-none ${getFontClass(selectedFont)}`} placeholder="edit ur text here" value={hookText} onChange={e => setHookText(e.target.value)} rows={3} />
                <div className="flex gap-2">
                  {(['top', 'middle', 'bottom'] as HookPosition[]).map(position => <Button key={position} variant={hookPosition === position ? 'default' : 'outline'} onPress={() => setHookPosition(position)} className={`capitalize flex-1 ${hookPosition !== position ? 'bg-white hover:bg-white/90' : ''}`}>
                      {position}
                    </Button>)}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-neutral-800">2. AI UGC</h2>
                <div className="flex items-center gap-4 text-sm">
                  <button className={`${selectedTab === "Templates" ? "text-neutral-900" : "text-neutral-500"}`} onClick={() => setSelectedTab("Templates")}>
                    Templates
                  </button>
                  <button className={`${selectedTab === "My UGC" ? "text-neutral-900" : "text-neutral-500"}`} onClick={() => setSelectedTab("My UGC")}>
                    My UGC
                  </button>
                  <div className="flex items-center gap-1 text-neutral-500">
                    <button className="hover:text-neutral-700" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                      <ChevronLeft size={16} />
                    </button>
                    <span>{currentPage}/{Math.max(1, totalPages)}</span>
                    <button className="hover:text-neutral-700" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-11 gap-2">
                {isLoading ? <div className="col-span-11 text-center py-8 text-neutral-500">
                    Loading videos...
                  </div> : avatarVideos.length === 0 ? <div className="col-span-11 text-center py-8 text-neutral-500">
                    No videos found in storage
                  </div> : currentVideos.map((video, index) => <button key={index} className={`aspect-[9/16] rounded-xl bg-white hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all overflow-hidden ${selectedVideo?.path === video.path ? 'ring-2 ring-primary ring-offset-2' : ''}`} onClick={() => setSelectedVideo(video)}>
                      <video src={video.url} className="w-full h-full object-cover rounded-xl" preload="metadata" muted loop playsInline controls={false} onError={e => console.error('Video loading error:', e)} onLoadStart={() => console.log('Video loading started:', video.url)} onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }} />
                    </button>)}
              </div>
            </div>

            <div>
              <h2 className="text-base font-medium mb-4 text-neutral-800">3. Demos</h2>
              <div className="flex gap-2">
                <FileTrigger onSelect={e => {
                if (!e) return;
                const file = Array.from(e)[0];
                if (file) {
                  handleDemoUpload({
                    target: {
                      files: [file]
                    }
                  } as any);
                }
              }}>
                  <Button variant="default" className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>{isUploading ? 'Uploading...' : 'Add Demo'}</span>
                  </Button>
                </FileTrigger>
              </div>
              {demoVideos.length > 0 && <div className="mt-4 grid grid-cols-6 gap-2">
                  {demoVideos.map(demo => <div key={demo.id} className="group relative aspect-[9/16]">
                      <button className={`w-full h-full rounded-xl bg-white hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all overflow-hidden ${selectedDemoVideo?.id === demo.id ? 'ring-2 ring-primary ring-offset-2' : ''}`} onClick={() => setSelectedDemoVideo(demo)}>
                        <video src={demo.url} className="w-full h-full object-contain" preload="metadata" muted playsInline controls={false} onEnded={e => {
                    if (selectedDemoVideo) {
                      e.currentTarget.classList.add('hidden');
                      const demoVideo = e.currentTarget.nextElementSibling as HTMLVideoElement;
                      demoVideo?.classList.remove('hidden');
                      demoVideo?.play();
                    }
                  }} />
                      </button>
                      <button onClick={e => handleDeleteDemo(demo, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" disabled={isDeleting}>
                        <Trash2 size={16} />
                      </button>
                    </div>)}
                </div>}
            </div>
          </div>

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
                  {selectedDemoVideo && <video key={selectedDemoVideo.url} src={selectedDemoVideo.url} className="w-full h-full object-contain hidden" muted playsInline controls={false} onEnded={e => {
                    setShowingDemo(false);
                    e.currentTarget.classList.add('hidden');
                    const mainVideo = e.currentTarget.previousElementSibling as HTMLVideoElement;
                    mainVideo?.classList.remove('hidden');
                    mainVideo?.play();
                  }} />}
                  {hookText && !showingDemo && <div className={`absolute left-0 right-0 px-6 pointer-events-none ${hookPosition === 'top' ? 'top-1/4' : hookPosition === 'middle' ? 'top-1/2 -translate-y-1/2' : 'bottom-1/4'}`}>
                      <div className={`text-white text-2xl font-bold text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] whitespace-pre-wrap break-words max-w-full ${getFontClass(selectedFont)}`}>
                        {hookText}
                      </div>
                    </div>}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                  Select an AI avatar to preview
                </div>
              )}
            </div>
            <Button 
              variant="default" 
              className="w-full h-14 text-base font-medium"
              onPress={handleGenerateVideo}
              isDisabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Generate Video'}
            </Button>
          </div>
        </div>
      </div>
      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-center text-neutral-500">
            {processingStep} {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default UGCEditor;
