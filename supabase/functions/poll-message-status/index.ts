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
}

interface StatusUpdateResult {
  messageId: string;
  twilioSid: string;
  oldStatus: string;
  newStatus: string;
  updated: boolean;
  error?: string;
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
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    if (limit > 500) {
      return new Response(
        JSON.stringify({ error: "Maximum limit is 500 messages per request" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: messagesToCheck, error: fetchError } = await supabase.rpc(
      "get_messages_needing_status_check",
      {
        p_limit: limit,
        p_max_checks: 20,
      }
    );

    if (fetchError) {
      console.error("Error fetching messages:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch messages for status check" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!messagesToCheck || messagesToCheck.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No messages need status checking at this time",
          checked: 0,
          updated: 0,
          results: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const results: StatusUpdateResult[] = [];
    let updatedCount = 0;

    for (const message of messagesToCheck) {
      const result: StatusUpdateResult = {
        messageId: message.id,
        twilioSid: message.twilio_message_sid,
        oldStatus: message.twilio_status,
        newStatus: message.twilio_status,
        updated: false,
      };

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
          result.error = errorData.message || "Twilio API error";
          results.push(result);
          continue;
        }

        const twilioData: TwilioMessageStatus = await twilioResponse.json();
        result.newStatus = twilioData.status;

        if (twilioData.status !== message.twilio_status) {
          const { error: updateError } = await supabase.rpc(
            "update_message_status",
            {
              p_message_id: message.id,
              p_new_status: twilioData.status,
              p_error_code: twilioData.error_code || null,
              p_error_message: twilioData.error_message || null,
            }
          );

          if (updateError) {
            console.error("Error updating status:", updateError);
            result.error = "Failed to update database";
          } else {
            result.updated = true;
            updatedCount++;
          }
        } else {
          const { error: checkError } = await supabase.rpc(
            "update_message_status",
            {
              p_message_id: message.id,
              p_new_status: twilioData.status,
              p_error_code: null,
              p_error_message: null,
            }
          );

          if (checkError) {
            console.error("Error updating check count:", checkError);
          }
        }
      } catch (error) {
        console.error(`Error checking message ${message.twilio_message_sid}:`, error);
        result.error = error.message || "Unknown error";
      }

      results.push(result);

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Status check completed. ${updatedCount} messages updated out of ${messagesToCheck.length} checked.`,
        checked: messagesToCheck.length,
        updated: updatedCount,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in poll-message-status function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
