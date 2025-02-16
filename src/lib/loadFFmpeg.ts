import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export async function loadFFmpeg(ffmpeg: FFmpeg) {
  if (ffmpeg.loaded) return;
  
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
    });
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw new Error('Failed to load video processor');
  }
} 