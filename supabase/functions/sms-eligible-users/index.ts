import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EligibleUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
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

    const { data: optedOutPhones, error: optOutError } = await supabase
      .from("sms_opt_outs")
      .select("phone_number");

    if (optOutError) {
      console.error("Error fetching opt-outs:", optOutError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch opt-out list" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const optedOutPhoneNumbers = optedOutPhones?.map((o) => o.phone_number) || [];

    let query = supabase
      .from("profiles")
      .select("id, first_name, last_name, phone, email")
      .eq("sms_consent", true)
      .not("phone", "is", null);

    if (optedOutPhoneNumbers.length > 0) {
      query = query.not("phone", "in", `(${optedOutPhoneNumbers.join(",")})`);
    }

    const { data: eligibleUsers, error: queryError } = await query.order(
      "last_name",
      { ascending: true }
    );

    if (queryError) {
      console.error("Error fetching eligible users:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch eligible users" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: eligibleUsers?.length || 0,
        users: eligibleUsers || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in sms-eligible-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
