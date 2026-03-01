"use server";

import midtrans from "midtrans-client";
import { createClient } from "@/lib/supabase/server";
import { FormState } from "@/types/general";
import { Cart, OrderFormState } from "@/types/order";
import { redirect } from "next/navigation";
import z from "zod";
import { environment } from "@/configs/environment";
import { headers } from "next/headers";
import {
  orderDineInFormSchema,
  orderTakeAwayFormSchema,
} from "@/validations/order-validation";

export async function createOrder(
  prevState: OrderFormState,
  formData: FormData,
) {
  const validatedFields = orderDineInFormSchema.safeParse({
    customer_name: formData.get("customer_name"),
    table_id: formData.get("table_id"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    const formatted = z.treeifyError(validatedFields.error);

    return {
      errors: {
        customer_name: formatted.properties?.customer_name?.errors,
        table_id: formatted.properties?.table_id?.errors,
        status: formatted.properties?.status?.errors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const orderId = `CAFEAPP-${Date.now()}`;

  const [orderResult, tableResult] = await Promise.all([
    supabase.from("orders").insert({
      order_id: orderId,
      customer_name: validatedFields.data.customer_name,
      table_id: validatedFields.data.table_id,
      status: validatedFields.data.status,
    }),
    supabase
      .from("tables")
      .update({
        status:
          validatedFields.data.status === "reserved"
            ? "reserved"
            : "unavailable",
      })
      .eq("id", validatedFields.data.table_id),
  ]);

  const orderError = orderResult.error;
  const tableError = tableResult.error;

  if (orderError || tableError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [
          ...(orderError ? [orderError.message] : []),
          ...(tableError ? [tableError.message] : []),
        ],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function createOrderTakeAway(
  prevState: OrderFormState,
  formData: FormData,
) {
  const validatedFields = orderTakeAwayFormSchema.safeParse({
    customer_name: formData.get("customer_name"),
    table_id: formData.get("table_id"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    const formatted = z.treeifyError(validatedFields.error);

    return {
      errors: {
        customer_name: formatted.properties?.customer_name?.errors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const orderId = `CAFEAPP-${Date.now()}`;

  const { error } = await supabase.from("orders").insert({
    order_id: orderId,
    customer_name: validatedFields.data.customer_name,
    status: "proccess",
  });

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,

        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function updateReservation(
  prevState: FormState,
  formData: FormData,
) {
  const supabase = await createClient();

  const [orderResult, tableResult] = await Promise.all([
    supabase
      .from("orders")
      .update({
        status: formData.get("status"),
      })
      .eq("id", formData.get("id")),
    supabase
      .from("tables")
      .update({
        status:
          formData.get("status") === "proccess" ? "unavailable" : "available",
      })
      .eq("id", formData.get("id")),
  ]);

  const orderError = orderResult.error;
  const tableError = tableResult.error;

  if (orderError || tableError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [
          ...(orderError ? [orderError.message] : []),
          ...(tableError ? [tableError.message] : []),
        ],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function addOrderItem(
  prevState: OrderFormState,
  data: {
    order_id: string;
    items: Cart[];
  },
) {
  const supabase = await createClient();

  const payload = data.items.map(({ menu, ...item }) => item);

  const { error } = await supabase.from("orders_menus").insert(payload);

  if (error) {
    return {
      status: "error",
      error: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  redirect(`/order/${data.order_id}`);
}

export async function updateStatusOrderItem(
  prevState: FormState,
  formData: FormData,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders_menus")
    .update({
      status: formData.get("status"),
    })
    .eq("id", formData.get("id"));

  if (error) {
    return {
      status: "error",
      error: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function generatePayment(
  prevState: FormState,
  formData: FormData,
) {
  const headerList = headers();
  const origin = (await headerList).get("origin");

  const supabase = await createClient();

  const orderId = formData.get("id");
  const grossAmount = formData.get("gross_amount");
  const customerName = formData.get("customer_name");

  const snap = new midtrans.Snap({
    isProduction: false,
    serverKey: environment.MIDTRANS_SERVER_KEY!,
  });

  const parameter = {
    transaction_details: {
      order_id: `${orderId}`,
      gross_amount: parseFloat(grossAmount as string),
    },
    customer_details: {
      first_name: customerName,
    },
    callbacks: {
      finish: `${origin}/payment/success`,
    },
  };

  const result = await snap.createTransaction(parameter);

  if (result.error_message) {
    return {
      status: "error",
      error: {
        ...prevState.errors,
        _form: [result.error_message],
      },
      data: {
        payment_token: "",
      },
    };
  }

  await supabase
    .from("orders")
    .update({ payment_token: result.token })
    .eq("order_id", orderId);

  return {
    status: "success",
    data: {
      payment_token: `${result.token}`,
    },
  };
}
