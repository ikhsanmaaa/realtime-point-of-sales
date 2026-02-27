import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
    } = body;

    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY")!;

    const encoder = new TextEncoder();
    const data = encoder.encode(
      order_id + status_code + gross_amount + serverKey,
    );

    const hashBuffer = await crypto.subtle.digest("SHA-512", data);

    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hash !== signature_key) {
      console.log("Invalid signature");
      return new Response("Invalid signature", { status: 403 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let newStatus = "pending";

    if (["settlement", "capture"].includes(transaction_status)) {
      newStatus = "settled";
    }

    if (["cancel", "deny", "expire"].includes(transaction_status)) {
      newStatus = "failed";
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", order_id)
      .select()
      .single();

    if (orderError) {
      console.error("Order update error:", orderError);
      return new Response("Order update failed", { status: 500 });
    }

    if (newStatus === "settled" && order?.table_id) {
      const { error: tableError } = await supabase
        .from("tables")
        .update({ status: "available" })
        .eq("id", order.table_id);

      if (tableError) {
        console.error("Table update error:", tableError);
        return new Response("Table update failed", { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Server Error", { status: 500 });
  }
});
