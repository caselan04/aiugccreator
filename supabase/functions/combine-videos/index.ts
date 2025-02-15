
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import '@tootallnate/xhr'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MUX_TOKEN_ID = Deno.env.get('MUX_TOKEN_ID')
const MUX_TOKEN_SECRET = Deno.env.get('MUX_TOKEN_SECRET')
const BASIC_AUTH = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoId } = await req.json()

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

    // Get signed URLs for the videos
    const { data: { publicUrl: avatarUrl } } = supabase.storage
      .from('aiugcavatars')
      .getPublicUrl(video.avatar_video_path)

    let demoUrl = null
    if (video.demo_video_path) {
      const { data: { publicUrl } } = supabase.storage
        .from('demo_videos')
        .getPublicUrl(video.demo_video_path)
      demoUrl = publicUrl
    }

    // Create an asset for the avatar video
    const avatarAssetResponse = await fetch('https://api.mux.com/video/v1/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: avatarUrl,
        playback_policy: ['public']
      })
    })

    if (!avatarAssetResponse.ok) {
      throw new Error(`Failed to create Mux asset for avatar video: ${await avatarAssetResponse.text()}`)
    }

    const avatarAsset = await avatarAssetResponse.json()
    console.log('Created Mux asset for avatar video:', avatarAsset)

    let demoAsset = null
    if (demoUrl) {
      const demoAssetResponse = await fetch('https://api.mux.com/video/v1/assets', {
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

      if (!demoAssetResponse.ok) {
        throw new Error(`Failed to create Mux asset for demo video: ${await demoAssetResponse.text()}`)
      }

      demoAsset = await demoAssetResponse.json()
      console.log('Created Mux asset for demo video:', demoAsset)
    }

    // Create a composition
    const compositionInput: any = {
      timeline: {
        tracks: [
          {
            type: 'video',
            clips: [
              {
                asset_id: avatarAsset.data.id,
                start_time: 0,
              }
            ]
          }
        ]
      },
      overlay: {
        text: [
          {
            text: video.hook_text,
            x: '(main_w - text_w) / 2', // Center horizontally
            y: video.hook_position === 'top' ? '10' : 
               video.hook_position === 'middle' ? '(main_h - text_h) / 2' : 
               '(main_h - text_h - 10)', // Position based on hook_position
            font_family: video.font_style === 'serif' ? 'serif' :
                        video.font_style === 'mono' ? 'monospace' :
                        'sans-serif',
            font_size: '24',
            color: 'white',
            stroke_color: 'black',
            stroke_width: 2
          }
        ]
      }
    }

    // If there's a demo video, add it to the timeline
    if (demoAsset) {
      compositionInput.timeline.tracks[0].clips.push({
        asset_id: demoAsset.data.id,
        start_time: 'auto'
      })
    }

    const compositionResponse = await fetch('https://api.mux.com/video/v1/compositions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(compositionInput)
    })

    if (!compositionResponse.ok) {
      throw new Error(`Failed to create Mux composition: ${await compositionResponse.text()}`)
    }

    const composition = await compositionResponse.json()
    console.log('Created Mux composition:', composition)

    // Update the video record with the Mux asset ID and status
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        combined_video_path: composition.data.playback_id,
        status: 'completed'
      })
      .eq('id', videoId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, playbackId: composition.data.playback_id }),
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
