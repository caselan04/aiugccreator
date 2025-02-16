import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export async function loadFFmpeg(ffmpeg: FFmpeg) {
  if (ffmpeg.loaded) return;
  
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(
        new URL('@ffmpeg/core/dist/ffmpeg-core.js', import.meta.url).href,
        'text/javascript'
      ),
      wasmURL: await toBlobURL(
        new URL('@ffmpeg/core/dist/ffmpeg-core.wasm', import.meta.url).href,
        'application/wasm'
      ),
    });
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw new Error('Failed to load video processor');
  }
} 