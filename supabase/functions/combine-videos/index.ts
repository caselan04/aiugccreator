
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MUX_TOKEN_ID = Deno.env.get('MUX_TOKEN_ID')
const MUX_TOKEN_SECRET = Deno.env.get('MUX_TOKEN_SECRET')
// Properly encode credentials for Basic Auth
const BASIC_AUTH = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoId } = await req.json()
    console.log('Processing video ID:', videoId)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get video details
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError) throw videoError
    console.log('Retrieved video details:', video)

    // Get signed URLs for the videos
    const { data: { publicUrl: avatarUrl } } = supabase.storage
      .from('aiugcavatars')
      .getPublicUrl(video.avatar_video_path)

    console.log('Avatar URL:', avatarUrl)

    let demoUrl = null
    if (video.demo_video_path) {
      const { data: { publicUrl } } = supabase.storage
        .from('demo_videos')
        .getPublicUrl(video.demo_video_path)
      demoUrl = publicUrl
      console.log('Demo URL:', demoUrl)
    }

    // Create the first asset with text overlay
    const firstAssetBody: any = {
      input: avatarUrl,
      playback_policy: ['public']
    }

    if (video.hook_text) {
      firstAssetBody.text_tracks = [{
        text_type: "subtitles",
        data: [{
          start_time: 0,
          text: video.hook_text,
          position: video.hook_position === 'top' ? 'top' : 
                   video.hook_position === 'middle' ? 'center' : 
                   'bottom',
          font_family: video.font_style === 'serif' ? 'serif' :
                      video.font_style === 'mono' ? 'monospace' :
                      'sans-serif',
          font_size: 24,
          color: '#FFFFFF',
          stroke_color: '#000000',
          stroke_width: 2
        }]
      }]
    }

    const firstAssetResponse = await fetch('https://api.mux.com/video/v1/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(firstAssetBody)
    })

    const firstAssetResponseText = await firstAssetResponse.text()
    console.log('First asset response:', firstAssetResponseText)

    if (!firstAssetResponse.ok) {
      throw new Error(`Failed to create first asset: ${firstAssetResponseText}`)
    }

    const firstAsset = JSON.parse(firstAssetResponseText)

    let finalAsset = firstAsset
    
    if (demoUrl) {
      // Create the second asset
      const secondAssetResponse = await fetch('https://api.mux.com/video/v1/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${BASIC_AUTH}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: demoUrl,
          playback_policy: ['public']
        })
      })

      const secondAssetResponseText = await secondAssetResponse.text()
      console.log('Second asset response:', secondAssetResponseText)

      if (!secondAssetResponse.ok) {
        throw new Error(`Failed to create second asset: ${secondAssetResponseText}`)
      }

      const secondAsset = JSON.parse(secondAssetResponseText)

      // Create a master asset that references both videos
      const masterAssetResponse = await fetch('https://api.mux.com/video/v1/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${BASIC_AUTH}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: [
            `https://stream.mux.com/${firstAsset.data.playback_ids[0].id}.m3u8`,
            `https://stream.mux.com/${secondAsset.data.playback_ids[0].id}.m3u8`
          ],
          playback_policy: ['public']
        })
      })

      const masterAssetResponseText = await masterAssetResponse.text()
      console.log('Master asset response:', masterAssetResponseText)

      if (!masterAssetResponse.ok) {
        throw new Error(`Failed to create master asset: ${masterAssetResponseText}`)
      }

      finalAsset = JSON.parse(masterAssetResponseText)
    }

    // Update the video record with the Mux asset ID and status
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        combined_video_path: finalAsset.data.playback_ids[0].id,
        status: 'completed'
      })
      .eq('id', videoId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, playbackId: finalAsset.data.playback_ids[0].id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in combine-videos function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
