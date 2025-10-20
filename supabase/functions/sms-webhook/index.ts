import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STOP_KEYWORDS = /^(STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT)$/i;

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

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const from = formData.get("From")?.toString();
    const to = formData.get("To")?.toString();
    const body = formData.get("Body")?.toString();
    const messageSid = formData.get("MessageSid")?.toString();
    const messageStatus = formData.get("SmsStatus")?.toString();

    if (!from || !to || !body || !messageSid) {
      console.error("Missing required webhook fields");
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        }
      );
    }

    const trimmedBody = body.trim();

    if (STOP_KEYWORDS.test(trimmedBody)) {
      const { error: optOutError } = await supabase
        .from("sms_opt_outs")
        .upsert(
          {
            phone_number: from,
            method: "STOP keyword",
            notes: `Received: ${trimmedBody}`,
          },
          { onConflict: "phone_number" }
        );

      if (optOutError) {
        console.error("Failed to save opt-out:", optOutError);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ sms_consent: false })
        .eq("phone", from);

      if (profileError) {
        console.error("Failed to update profile consent:", profileError);
      }

      console.log(`Opt-out processed for ${from}`);
    }

    let conversationId: string;
    const { data: existingConversation } = await supabase
      .from("sms_conversations")
      .select("id")
      .eq("customer_phone", from)
      .single();

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", from)
        .single();

      const { data: newConversation, error: convError } = await supabase
        .from("sms_conversations")
        .insert({
          customer_phone: from,
          customer_id: profile?.id || null,
          status: "active",
        })
        .select("id")
        .single();

      if (convError || !newConversation) {
        console.error("Failed to create conversation:", convError);
        return new Response(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "text/xml" },
          }
        );
      }

      conversationId = newConversation.id;
    }

    const { error: messageError } = await supabase
      .from("sms_messages")
      .insert({
        conversation_id: conversationId,
        twilio_message_sid: messageSid,
        direction: "inbound",
        from_number: from,
        to_number: to,
        body: body,
        status: messageStatus || "received",
      });

    if (messageError) {
      console.error("Failed to save inbound message:", messageError);
    }

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("Error in sms-webhook function:", error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      }
    );
  }
});
