"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { supabaseDefault } from "@/lib/supabase/default";

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order_id) return;

    const fetchInitialStatus = async () => {
      const { data } = await supabaseDefault
        .from("orders")
        .select("status")
        .eq("order_id", order_id)
        .single();

      if (data) {
        setStatus(data.status);
        setLoading(false);
      }
    };

    fetchInitialStatus();

    const channel = supabaseDefault
      .channel("orders-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `order_id=eq.${order_id}`,
        },
        (payload) => {
          setStatus(payload.new.status);
        },
      )
      .subscribe();

    return () => {
      supabaseDefault.removeChannel(channel);
    };
  }, [order_id, status]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader className="animate-spin size-10" />
        <p>Checking payment status...</p>
      </div>
    );
  }

  if (status === "settled") {
    return (
      <div className="flex flex-col items-center gap-4">
        <CheckCircle className="size-16 text-green-500" />
        <h1 className="text-2xl font-bold">Payment Success!</h1>
        <Link href="/order">
          <Button>Back To Order</Button>
        </Link>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center gap-4">
        <XCircle className="size-16 text-red-500" />
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        <Link href="/order">
          <Button>Back To Order</Button>
        </Link>
      </div>
    );
  }
}
