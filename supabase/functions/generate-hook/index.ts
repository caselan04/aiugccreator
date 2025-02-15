
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify content type
    if (req.headers.get("content-type") !== "application/json") {
      throw new Error("Invalid content type. Expected application/json");
    }

    const { prompt } = await req.json();
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Received prompt:", prompt);

    // Construct the system prompt for hook generation
    const systemPrompt = `You are an expert TikTok content creator specializing in creating engaging hooks (first 3 seconds of content). 
    Given a product or service description, create a short, attention-grabbing hook that would work well as the opening line for a TikTok video.
    The hook should be 1-2 sentences maximum, be conversational, and create curiosity or highlight a pain point.
    Do not use hashtags or emojis. Focus on making it sound natural and engaging.`;

    const userPrompt = `Product/Service Description: ${prompt}\n\nCreate a TikTok hook that's conversational and engaging.`;

    // Check if REPLICATE_API_KEY is available
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not configured");
    }

    console.log("Making request to Replicate API...");
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "deepseek-ai/deepseek-r1",
        input: {
          prompt: systemPrompt + "\n\n" + userPrompt,
          max_tokens: 20480,
          temperature: 0.1,
          top_p: 1,
          presence_penalty: 0,
          frequency_penalty: 0
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Replicate API error:", errorData);
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();
    console.log("Replicate API response:", prediction);

    if (!prediction.id) {
      throw new Error("Invalid response from Replicate API");
    }

    // Poll for the result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!pollResponse.ok) {
        console.error("Polling error:", await pollResponse.text());
        throw new Error(`Polling error: ${pollResponse.status}`);
      }

      result = await pollResponse.json();
      console.log("Polling status:", result.status);
    }

    if (result.status === "failed" || attempts >= maxAttempts) {
      throw new Error(result.error || "Failed to generate hook or timeout reached");
    }

    // Handle the output
    const generatedHook = Array.isArray(result.output) ? result.output[0] : result.output;
    if (!generatedHook) {
      throw new Error("No hook generated");
    }

    console.log("Generated hook:", generatedHook);
    return new Response(JSON.stringify({ hook: generatedHook }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-hook function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
