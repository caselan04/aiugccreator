
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MUX_TOKEN_ID = Deno.env.get('MUX_TOKEN_ID')
const MUX_TOKEN_SECRET = Deno.env.get('MUX_TOKEN_SECRET')
const BASIC_AUTH = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)

// Function to wait for asset to be ready
async function waitForAssetReady(assetId: string): Promise<void> {
  let ready = false
  let attempts = 0
  const maxAttempts = 30 // 30 attempts with 2 second delay = 60 seconds max wait time

  while (!ready && attempts < maxAttempts) {
    const response = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to check asset status: ${await response.text()}`)
    }

    const data = await response.json()
    console.log(`Asset ${assetId} status:`, data.data.status)

    if (data.data.status === 'ready') {
      ready = true
    } else if (data.data.status === 'errored') {
      throw new Error(`Asset ${assetId} failed to process`)
    } else {
      attempts++
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds before next check
    }
  }

  if (!ready) {
    throw new Error(`Asset ${assetId} did not become ready within the timeout period`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoId } = await req.json()
    console.log('Processing video ID:', videoId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError) throw videoError
    console.log('Retrieved video details:', video)

    const { data: { publicUrl: avatarUrl } } = supabase.storage
      .from('aiugcavatars')
      .getPublicUrl(video.avatar_video_path)

    console.log('Avatar URL:', avatarUrl)

    // Create first asset
    const firstAssetResponse = await fetch('https://api.mux.com/video/v1/assets', {
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

    if (!firstAssetResponse.ok) {
      throw new Error(`Failed to create first asset: ${await firstAssetResponse.text()}`)
    }

    const firstAsset = await firstAssetResponse.json()
    console.log('First asset created:', firstAsset)

    // Wait for first asset to be ready
    await waitForAssetReady(firstAsset.data.id)
    console.log('First asset is ready')

    let finalAsset = firstAsset

    if (video.demo_video_path) {
      const { data: { publicUrl: demoUrl } } = supabase.storage
        .from('demo_videos')
        .getPublicUrl(video.demo_video_path)
      console.log('Demo URL:', demoUrl)

      // Create second asset
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

      if (!secondAssetResponse.ok) {
        throw new Error(`Failed to create second asset: ${await secondAssetResponse.text()}`)
      }

      const secondAsset = await secondAssetResponse.json()
      console.log('Second asset created:', secondAsset)

      // Wait for second asset to be ready
      await waitForAssetReady(secondAsset.data.id)
      console.log('Second asset is ready')

      // Create composition to combine videos
      const compositionResponse = await fetch('https://api.mux.com/video/v1/compositions', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${BASIC_AUTH}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeline: {
            tracks: [
              {
                type: "video",
                clips: [
                  {
                    "asset_id": firstAsset.data.id,
                    "start_time": 0,
                    "duration": null // Use full duration
                  },
                  {
                    "asset_id": secondAsset.data.id,
                    "start_time": 0,
                    "duration": null // Use full duration
                  }
                ]
              }
            ]
          },
          output: {
            playback_policy: ["public"]
          }
        })
      })

      if (!compositionResponse.ok) {
        const errorText = await compositionResponse.text()
        console.error('Composition creation failed with response:', errorText)
        throw new Error(`Failed to create composition: ${errorText}`)
      }

      finalAsset = await compositionResponse.json()
      console.log('Composition created:', finalAsset)

      // Wait for the composition to be ready
      await waitForAssetReady(finalAsset.data.asset_id)
      console.log('Composition is ready')
    }

    // Update video record
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
