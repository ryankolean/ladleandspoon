import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TwilioMessageStatus {
  sid: string;
  status: string;
  error_code?: string | null;
  error_message?: string | null;
  date_sent?: string | null;
  date_updated?: string | null;
  to: string;
  from: string;
  body: string;
  price?: string | null;
  price_unit?: string | null;
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

    if (!twilioAccountSid || !twilioAuthToken) {
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

    const { data: profileData } = await supabase.rpc("get_my_profile");
    const profile = profileData && profileData.length > 0 ? profileData[0] : null;

    if (!profile || profile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const twilioSid = url.searchParams.get("sid");
    const messageId = url.searchParams.get("messageId");
    const batchId = url.searchParams.get("batchId");

    if (!twilioSid && !messageId && !batchId) {
      return new Response(
        JSON.stringify({
          error: "One of the following parameters is required: sid, messageId, or batchId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let messagesToCheck = [];

    if (twilioSid) {
      const { data, error } = await supabase
        .from("sms_message_audit")
        .select("id, twilio_message_sid, twilio_status, phone_number, user_id")
        .eq("twilio_message_sid", twilioSid)
        .maybeSingle();

      if (error) {
        console.error("Error fetching message:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch message" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: "Message not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      messagesToCheck = [data];
    } else if (messageId) {
      const { data, error } = await supabase
        .from("sms_message_audit")
        .select("id, twilio_message_sid, twilio_status, phone_number, user_id")
        .eq("id", messageId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching message:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch message" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: "Message not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      messagesToCheck = [data];
    } else if (batchId) {
      const { data, error } = await supabase
        .from("sms_message_audit")
        .select("id, twilio_message_sid, twilio_status, phone_number, user_id")
        .eq("batch_id", batchId)
        .not("twilio_message_sid", "is", null)
        .limit(100);

      if (error) {
        console.error("Error fetching batch messages:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch batch messages" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      messagesToCheck = data || [];
    }

    if (messagesToCheck.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No messages found to check",
          statuses: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const statuses = [];

    for (const message of messagesToCheck) {
      if (!message.twilio_message_sid) {
        statuses.push({
          messageId: message.id,
          error: "No Twilio SID available",
        });
        continue;
      }

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages/${message.twilio_message_sid}.json`;

        const twilioResponse = await fetch(twilioUrl, {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });

        if (!twilioResponse.ok) {
          const errorData = await twilioResponse.json();
          statuses.push({
            messageId: message.id,
            twilioSid: message.twilio_message_sid,
            error: errorData.message || "Twilio API error",
          });
          continue;
        }

        const twilioData: TwilioMessageStatus = await twilioResponse.json();

        if (twilioData.status !== message.twilio_status) {
          await supabase.rpc("update_message_status", {
            p_message_id: message.id,
            p_new_status: twilioData.status,
            p_error_code: twilioData.error_code || null,
            p_error_message: twilioData.error_message || null,
          });
        }

        statuses.push({
          messageId: message.id,
          twilioSid: twilioData.sid,
          status: twilioData.status,
          to: twilioData.to,
          from: twilioData.from,
          errorCode: twilioData.error_code,
          errorMessage: twilioData.error_message,
          dateSent: twilioData.date_sent,
          dateUpdated: twilioData.date_updated,
          price: twilioData.price,
          priceUnit: twilioData.price_unit,
        });
      } catch (error) {
        console.error(`Error checking message ${message.twilio_message_sid}:`, error);
        statuses.push({
          messageId: message.id,
          twilioSid: message.twilio_message_sid,
          error: error.message || "Unknown error",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Status retrieved for ${statuses.length} message(s)`,
        statuses,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in check-message-status function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
