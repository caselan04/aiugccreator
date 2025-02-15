
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    // Construct the system prompt for hook generation
    const systemPrompt = `You are an expert TikTok content creator specializing in creating engaging hooks (first 3 seconds of content). 
    Given a product or service description, create a short, attention-grabbing hook that would work well as the opening line for a TikTok video.
    The hook should be 1-2 sentences maximum, be conversational, and create curiosity or highlight a pain point.
    Do not use hashtags or emojis. Focus on making it sound natural and engaging.`;

    const userPrompt = `Product/Service Description: ${prompt}\n\nCreate a TikTok hook that's conversational and engaging.`;

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${Deno.env.get("REPLICATE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1",
        input: {
          prompt: systemPrompt + "\n\n" + userPrompt,
          temperature: 0.7,
          max_length: 100,
          top_p: 0.9,
        },
      }),
    });

    const prediction = await response.json();
    console.log("Replicate API response:", prediction);

    // First get the prediction ID
    const predictionId = prediction.id;
    
    // Poll for the result
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${Deno.env.get("REPLICATE_API_KEY")}`,
            "Content-Type": "application/json",
          },
        }
      );
      result = await pollResponse.json();
      console.log("Polling status:", result.status);
    }

    if (result.status === "failed") {
      throw new Error("Failed to generate hook");
    }

    // The output will be in result.output
    const generatedHook = result.output;
    
    return new Response(JSON.stringify({ hook: generatedHook }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error in generate-hook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
