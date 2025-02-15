import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Video = {
  id: string;
  created_at: string;
  title: string;
  hook_text: string;
  status: 'processing' | 'completed' | 'failed';
  file_path: string;
  avatar_video_path: string;
  demo_video_path?: string;
  error_message?: string;
  font_style?: 'sans' | 'serif' | 'mono';
  hook_position?: 'top' | 'middle' | 'bottom';
};

const getFontClass = (font?: string) => {
  switch (font) {
    case 'serif':
      return 'font-serif';
    case 'mono':
      return 'font-mono';
    default:
      return 'font-sans';
  }
};

const Videos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return [];
      }

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download video",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 bg-neutral-100">
          <div className="p-6">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-neutral-900">My Videos</h1>
                <Button onPress={() => navigate("/dashboard")}>
                  Create New Video
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Hook Text</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : videos?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                          No videos found. Create your first video now!
                        </TableCell>
                      </TableRow>
                    ) : (
                      videos?.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell className="font-medium">
                            {video.title || "Untitled"}
                          </TableCell>
                          <TableCell>{video.hook_text || "No hook text"}</TableCell>
                          <TableCell>
                            {new Date(video.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                video.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : video.status === "processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {video.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {video.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onPress={() => setSelectedVideo(video)}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onPress={() => handleDelete(video.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {selectedVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50">
                  <div className="bg-white rounded-xl p-4 max-w-md w-full relative">
                    <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4 relative">
                      <video
                        src={`${supabase.storage.from('aiugcavatars').getPublicUrl(selectedVideo.avatar_video_path).data.publicUrl}`}
                        controls
                        className="w-full h-full object-contain"
                        onEnded={(e) => {
                          if (selectedVideo.demo_video_path) {
                            e.currentTarget.classList.add('hidden');
                            const demoVideo = e.currentTarget.nextElementSibling as HTMLVideoElement;
                            if (demoVideo) {
                              demoVideo.classList.remove('hidden');
                              demoVideo.play();
                            }
                          }
                        }}
                      />
                      {selectedVideo.demo_video_path && (
                        <video
                          src={`${supabase.storage.from('demo_videos').getPublicUrl(selectedVideo.demo_video_path).data.publicUrl}`}
                          controls
                          className="w-full h-full object-contain hidden"
                          onEnded={(e) => {
                            e.currentTarget.classList.add('hidden');
                            const mainVideo = e.currentTarget.previousElementSibling as HTMLVideoElement;
                            if (mainVideo) {
                              mainVideo.classList.remove('hidden');
                              mainVideo.play();
                            }
                          }}
                        />
                      )}
                      {selectedVideo.hook_text && (
                        <div className={`absolute left-0 right-0 px-6 pointer-events-none ${
                          selectedVideo.hook_position === 'top' ? 'top-1/4' :
                          selectedVideo.hook_position === 'middle' ? 'top-1/2 -translate-y-1/2' :
                          'bottom-1/4'
                        }`}>
                          <div className={`text-white text-2xl font-bold text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] whitespace-pre-wrap break-words max-w-full ${getFontClass(selectedVideo.font_style)}`}>
                            {selectedVideo.hook_text}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onPress={() => handleDownload(
                            supabase.storage.from('aiugcavatars').getPublicUrl(selectedVideo.avatar_video_path).data.publicUrl,
                            `ugc-${selectedVideo.id}.mp4`
                          )}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download UGC
                        </Button>
                        {selectedVideo.demo_video_path && (
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => handleDownload(
                              supabase.storage.from('demo_videos').getPublicUrl(selectedVideo.demo_video_path!).data.publicUrl,
                              `demo-${selectedVideo.id}.mp4`
                            )}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Demo
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onPress={() => setSelectedVideo(null)}
                      >
                        Close
                      </Button>
                    </div>
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

export default Videos;
