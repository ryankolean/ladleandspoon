import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BatchSMSRequest {
  userIds: string[];
  messageTemplate: string;
}

interface SendResult {
  userId: string;
  phone: string;
  status: "success" | "failed" | "skipped";
  twilioSid?: string;
  twilioStatus?: string;
  error?: string;
  reason?: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  sms_consent: boolean;
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
    const twilioApiKeySid = Deno.env.get("TWILIO_API_KEY_SID");
    const twilioApiKeySecret = Deno.env.get("TWILIO_API_KEY_SECRET");
    const twilioMessagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

    if (!twilioAccountSid || !twilioApiKeySid || !twilioApiKeySecret || !twilioMessagingServiceSid) {
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

    const { userIds, messageTemplate }: BatchSMSRequest = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "userIds array is required and cannot be empty" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!messageTemplate || typeof messageTemplate !== "string" || messageTemplate.trim() === "") {
      return new Response(
        JSON.stringify({ error: "messageTemplate is required and cannot be empty" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (userIds.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Maximum 1000 users per batch" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, phone, email, sms_consent")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid users found with provided IDs" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: optedOutPhones } = await supabase
      .from("sms_opt_outs")
      .select("phone_number");

    const optedOutSet = new Set(
      optedOutPhones?.map((o) => o.phone_number) || []
    );

    const batchId = crypto.randomUUID();
    const results: SendResult[] = [];
    const auditRecords: any[] = [];

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const credentials = btoa(`${twilioApiKeySid}:${twilioApiKeySecret}`);

    for (const userRecord of users as User[]) {
      let result: SendResult = {
        userId: userRecord.id,
        phone: userRecord.phone || "N/A",
        status: "skipped",
      };

      if (!userRecord.phone) {
        result.reason = "No phone number on file";
        results.push(result);

        auditRecords.push({
          user_id: userRecord.id,
          phone_number: "N/A",
          message_body: "",
          template_used: messageTemplate,
          twilio_status: "skipped",
          error_message: "No phone number on file",
          sent_by: profile.id,
          batch_id: batchId,
        });
        continue;
      }

      if (!userRecord.sms_consent) {
        result.reason = "User has not consented to SMS";
        results.push(result);

        auditRecords.push({
          user_id: userRecord.id,
          phone_number: userRecord.phone,
          message_body: "",
          template_used: messageTemplate,
          twilio_status: "skipped",
          error_message: "User has not consented to SMS",
          sent_by: profile.id,
          batch_id: batchId,
        });
        continue;
      }

      if (optedOutSet.has(userRecord.phone)) {
        result.reason = "User has opted out of SMS communications";
        results.push(result);

        auditRecords.push({
          user_id: userRecord.id,
          phone_number: userRecord.phone,
          message_body: "",
          template_used: messageTemplate,
          twilio_status: "skipped",
          error_message: "User has opted out",
          sent_by: profile.id,
          batch_id: batchId,
        });
        continue;
      }

      const firstName = userRecord.first_name || "Customer";
      const personalizedMessage = messageTemplate.replace(/\[First Name\]/g, firstName);

      try {
        const formData = new URLSearchParams();
        formData.append("To", userRecord.phone);
        formData.append("MessagingServiceSid", twilioMessagingServiceSid);
        formData.append("Body", personalizedMessage);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const twilioData = await twilioResponse.json();

        if (twilioResponse.ok) {
          result.status = "success";
          result.twilioSid = twilioData.sid;
          result.twilioStatus = twilioData.status;

          auditRecords.push({
            user_id: userRecord.id,
            phone_number: userRecord.phone,
            message_body: personalizedMessage,
            template_used: messageTemplate,
            twilio_message_sid: twilioData.sid,
            twilio_status: twilioData.status,
            sent_by: profile.id,
            batch_id: batchId,
          });
        } else {
          result.status = "failed";
          result.error = twilioData.message || "Twilio API error";

          auditRecords.push({
            user_id: userRecord.id,
            phone_number: userRecord.phone,
            message_body: personalizedMessage,
            template_used: messageTemplate,
            twilio_status: "failed",
            error_code: twilioData.code?.toString(),
            error_message: twilioData.message,
            sent_by: profile.id,
            batch_id: batchId,
          });
        }
      } catch (error) {
        result.status = "failed";
        result.error = error.message || "Failed to send SMS";

        auditRecords.push({
          user_id: userRecord.id,
          phone_number: userRecord.phone,
          message_body: personalizedMessage,
          template_used: messageTemplate,
          twilio_status: "failed",
          error_message: error.message,
          sent_by: profile.id,
          batch_id: batchId,
        });
      }

      results.push(result);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (auditRecords.length > 0) {
      const { error: auditError } = await supabase
        .from("sms_message_audit")
        .insert(auditRecords);

      if (auditError) {
        console.error("Failed to save audit records:", auditError);
      }
    }

    const summary = {
      total: results.length,
      successful: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: results.filter((r) => r.status === "skipped").length,
    };

    return new Response(
      JSON.stringify({
        success: true,
        batchId,
        summary,
        results,
        message: `Batch SMS campaign completed. ${summary.successful} sent, ${summary.failed} failed, ${summary.skipped} skipped.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-batch-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
