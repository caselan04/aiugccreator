
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

    const avatarResponseText = await avatarAssetResponse.text()
    console.log('Mux avatar asset response:', avatarResponseText)

    if (!avatarAssetResponse.ok) {
      throw new Error(`Failed to create Mux asset for avatar video: ${avatarResponseText}`)
    }

    const avatarAsset = JSON.parse(avatarResponseText)
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

      const demoResponseText = await demoAssetResponse.text()
      console.log('Mux demo asset response:', demoResponseText)

      if (!demoAssetResponse.ok) {
        throw new Error(`Failed to create Mux asset for demo video: ${demoResponseText}`)
      }

      demoAsset = JSON.parse(demoResponseText)
      console.log('Created Mux asset for demo video:', demoAsset)
    }

    // Prepare the input array for the final composition
    const inputs = []

    // Add avatar video with overlay if there's hook text
    const avatarInput: any = { url: avatarUrl }
    if (video.hook_text) {
      avatarInput.overlay = {
        text: [{
          text: video.hook_text,
          x: '(w-tw)/2',
          y: video.hook_position === 'top' ? '10' : 
             video.hook_position === 'middle' ? '(h-th)/2' : 
             'h-th-10',
          font_family: video.font_style === 'serif' ? 'serif' :
                      video.font_style === 'mono' ? 'monospace' :
                      'sans-serif',
          font_size: '24',
          color: 'white',
          stroke_color: 'black',
          stroke_width: '2'
        }]
      }
    }
    inputs.push(avatarInput)

    // Add demo video if it exists
    if (demoUrl) {
      inputs.push({ url: demoUrl })
    }

    console.log('Sending composition request with inputs:', JSON.stringify(inputs, null, 2))

    const compositionResponse = await fetch('https://api.mux.com/video/v1/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: inputs,
        playback_policy: ['public']
      })
    })

    const compositionResponseText = await compositionResponse.text()
    console.log('Mux composition response:', compositionResponseText)

    if (!compositionResponse.ok) {
      throw new Error(`Failed to create Mux composition: ${compositionResponseText}`)
    }

    const composition = JSON.parse(compositionResponseText)
    console.log('Created Mux composition:', composition)

    // Update the video record with the Mux asset ID and status
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        combined_video_path: composition.data.playback_ids[0].id,
        status: 'completed'
      })
      .eq('id', videoId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, playbackId: composition.data.playback_ids[0].id }),
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
