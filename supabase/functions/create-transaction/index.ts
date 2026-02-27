import Midtrans from "npm:midtrans-client@1.3.1";

Deno.serve(async (req) => {
  try {
    const raw = await req.text();
    const body = JSON.parse(raw);

    const snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: Deno.env.get("MIDTRANS_SERVER_KEY"),
    });

    const parameter = {
      transaction_details: {
        order_id: body.orderId,
        gross_amount: body.grossAmount,
      },
      callbacks: {
        finish: body.finishUrl,
        notification_url:
          "https://gxdtcyyjkqltlnwjzncl.supabase.co/functions/v1/midtrans-webhook",
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return new Response(JSON.stringify({ token: transaction.token }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
