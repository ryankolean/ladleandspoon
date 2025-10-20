import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendSMSRequest {
  to: string;
  body: string;
  fromNumber?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioMessagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

    if (!twilioAccountSid || !twilioAuthToken || !twilioMessagingServiceSid) {
      throw new Error("Twilio credentials not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { to, body, fromNumber }: SendSMSRequest = await req.json();

    if (!to || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(to)) {
      return new Response(
        JSON.stringify({ error: "Phone number must be in E.164 format (e.g., +15551234567)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: optOut } = await supabase
      .from("sms_opt_outs")
      .select("phone_number")
      .eq("phone_number", to)
      .single();

    if (optOut) {
      return new Response(
        JSON.stringify({ error: "Customer has opted out of SMS communications" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let conversationId: string;
    const { data: existingConversation } = await supabase
      .from("sms_conversations")
      .select("id")
      .eq("customer_phone", to)
      .single();

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", to)
        .single();

      const { data: newConversation, error: convError } = await supabase
        .from("sms_conversations")
        .insert({
          customer_phone: to,
          customer_id: profile?.id || null,
          status: "active",
        })
        .select("id")
        .single();

      if (convError || !newConversation) {
        throw new Error(`Failed to create conversation: ${convError?.message}`);
      }

      conversationId = newConversation.id;
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("MessagingServiceSid", twilioMessagingServiceSid);
    formData.append("Body", body);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      const { error: insertError } = await supabase
        .from("sms_messages")
        .insert({
          conversation_id: conversationId,
          direction: "outbound",
          from_number: twilioData.from || fromNumber || "unknown",
          to_number: to,
          body: body,
          status: "failed",
          error_code: twilioData.code?.toString(),
          error_message: twilioData.message,
        });

      if (insertError) {
        console.error("Failed to save error message:", insertError);
      }

      return new Response(
        JSON.stringify({ error: twilioData.message || "Failed to send SMS" }),
        {
          status: twilioResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: savedMessage, error: insertError } = await supabase
      .from("sms_messages")
      .insert({
        conversation_id: conversationId,
        twilio_message_sid: twilioData.sid,
        direction: "outbound",
        from_number: twilioData.from,
        to_number: twilioData.to,
        body: twilioData.body,
        status: twilioData.status,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save message:", insertError);
      return new Response(
        JSON.stringify({ error: "Message sent but failed to save to database" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: savedMessage,
        twilioSid: twilioData.sid,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
