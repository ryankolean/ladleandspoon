import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TwilioWebhookPayload {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
}

const STOP_KEYWORDS = [
  "stop",
  "stopall",
  "unsubscribe",
  "cancel",
  "end",
  "quit",
];

const START_KEYWORDS = ["start", "unstop", "subscribe", "yes"];

function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = "1" + cleaned;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return "+" + cleaned;
  }
  return phone;
}

function isStopKeyword(body: string): boolean {
  const normalized = body.toLowerCase().trim();
  return STOP_KEYWORDS.includes(normalized);
}

function isStartKeyword(body: string): boolean {
  const normalized = body.toLowerCase().trim();
  return START_KEYWORDS.includes(normalized);
}

async function sendTwilioResponse(message: string): Promise<Response> {
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`;
  return new Response(twimlResponse, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

async function sendEmptyTwilioResponse(): Promise<Response> {
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;
  return new Response(twimlResponse, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
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
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const formData = await req.formData();
    const webhookData: TwilioWebhookPayload = {
      MessageSid: formData.get("MessageSid") as string,
      From: formData.get("From") as string,
      To: formData.get("To") as string,
      Body: (formData.get("Body") as string) || "",
      NumMedia: formData.get("NumMedia") as string,
      MediaUrl0: formData.get("MediaUrl0") as string,
    };

    console.log("Received webhook:", {
      sid: webhookData.MessageSid,
      from: webhookData.From,
      body: webhookData.Body,
    });

    if (!webhookData.MessageSid || !webhookData.From || !webhookData.To) {
      console.error("Missing required webhook fields");
      return sendEmptyTwilioResponse();
    }

    const fromPhone = normalizePhoneNumber(webhookData.From);
    const toPhone = normalizePhoneNumber(webhookData.To);
    const messageBody = webhookData.Body.trim();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, sms_consent")
      .eq("phone", fromPhone)
      .maybeSingle();

    if (isStopKeyword(messageBody)) {
      console.log(\`STOP keyword detected from \${fromPhone}\`);

      const { data: existingOptOut } = await supabase
        .from("sms_opt_outs")
        .select("id")
        .eq("phone_number", fromPhone)
        .maybeSingle();

      if (!existingOptOut) {
        await supabase.from("sms_opt_outs").insert({
          phone_number: fromPhone,
          opted_out_at: new Date().toISOString(),
          method: "STOP keyword",
          notes: \`User replied with: \${messageBody}\`,
        });
      }

      if (profile) {
        await supabase
          .from("profiles")
          .update({ sms_consent: false })
          .eq("id", profile.id);
      }

      let conversation = null;
      const { data: existingConv } = await supabase
        .from("sms_conversations")
        .select("id")
        .eq("customer_phone", fromPhone)
        .maybeSingle();

      if (existingConv) {
        conversation = existingConv;
      } else {
        const { data: newConv } = await supabase
          .from("sms_conversations")
          .insert({
            customer_phone: fromPhone,
            customer_id: profile?.id || null,
            last_message_at: new Date().toISOString(),
            status: "active",
            unread_count: 1,
          })
          .select()
          .single();
        conversation = newConv;
      }

      if (conversation) {
        await supabase.from("sms_messages").insert({
          conversation_id: conversation.id,
          twilio_message_sid: webhookData.MessageSid,
          direction: "inbound",
          from_number: fromPhone,
          to_number: toPhone,
          body: messageBody,
          status: "received",
          sent_at: new Date().toISOString(),
        });
      }

      console.log(\`Opt-out processed for \${fromPhone}\`);
      return sendTwilioResponse(
        "You have been unsubscribed from SMS messages. Reply START to resubscribe."
      );
    }

    if (isStartKeyword(messageBody)) {
      console.log(\`START keyword detected from \${fromPhone}\`);

      await supabase
        .from("sms_opt_outs")
        .delete()
        .eq("phone_number", fromPhone);

      if (profile) {
        await supabase
          .from("profiles")
          .update({ sms_consent: true })
          .eq("id", profile.id);
      }

      let conversation = null;
      const { data: existingConv } = await supabase
        .from("sms_conversations")
        .select("id")
        .eq("customer_phone", fromPhone)
        .maybeSingle();

      if (existingConv) {
        conversation = existingConv;
        await supabase
          .from("sms_conversations")
          .update({
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversation.id);
      } else {
        const { data: newConv } = await supabase
          .from("sms_conversations")
          .insert({
            customer_phone: fromPhone,
            customer_id: profile?.id || null,
            last_message_at: new Date().toISOString(),
            status: "active",
            unread_count: 1,
          })
          .select()
          .single();
        conversation = newConv;
      }

      if (conversation) {
        await supabase.from("sms_messages").insert({
          conversation_id: conversation.id,
          twilio_message_sid: webhookData.MessageSid,
          direction: "inbound",
          from_number: fromPhone,
          to_number: toPhone,
          body: messageBody,
          status: "received",
          sent_at: new Date().toISOString(),
        });
      }

      console.log(\`Opt-in processed for \${fromPhone}\`);
      return sendTwilioResponse(
        "You have been resubscribed to SMS messages. Reply STOP to opt out."
      );
    }

    let conversation = null;
    const { data: existingConv } = await supabase
      .from("sms_conversations")
      .select("id, unread_count")
      .eq("customer_phone", fromPhone)
      .maybeSingle();

    if (existingConv) {
      conversation = existingConv;
      await supabase
        .from("sms_conversations")
        .update({
          last_message_at: new Date().toISOString(),
          unread_count: (existingConv.unread_count || 0) + 1,
        })
        .eq("id", conversation.id);
    } else {
      const { data: newConv } = await supabase
        .from("sms_conversations")
        .insert({
          customer_phone: fromPhone,
          customer_id: profile?.id || null,
          last_message_at: new Date().toISOString(),
          status: "active",
          unread_count: 1,
        })
        .select()
        .single();
      conversation = newConv;
    }

    if (conversation) {
      await supabase.from("sms_messages").insert({
        conversation_id: conversation.id,
        twilio_message_sid: webhookData.MessageSid,
        direction: "inbound",
        from_number: fromPhone,
        to_number: toPhone,
        body: messageBody,
        status: "received",
        sent_at: new Date().toISOString(),
      });
      console.log(\`Stored inbound message from \${fromPhone}\`);
    }

    return sendEmptyTwilioResponse();
  } catch (error) {
    console.error("Error processing webhook:", error);
    return sendEmptyTwilioResponse();
  }
});
