import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS for React Native frontend
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify user authentication (Supabase securely attaches the JWT)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized. Must be logged in.' }), { status: 401, headers: corsHeaders })
    }

    // Optional: Implement strict rate limiting here by checking Redis or Supabase tables for request counts per user IP/ID

    // 2. Parse the request from the frontend
    const { prompt, temperature } = await req.json()
    
    // 3. Fetch the HIDDEN API KEY from the server environment 
    // (Hackers can never see this because it only lives on the cloud server)
    const apiKey = Deno.env.get('GEMINI_PRIVATE_API_KEY')

    if (!apiKey) {
        throw new Error("Backend misconfiguration: Missing GEMINI_PRIVATE_API_KEY");
    }

    // 4. Securely ping Google AI from the server
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: temperature || 0.7 }
        })
    });

    const result = await response.json();
    
    // 5. Send data safely down to the mobile device
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
