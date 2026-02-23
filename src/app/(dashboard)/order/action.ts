"use server";

import { createClient } from "@/lib/supabase/server";
import { FormState } from "@/types/general";
import { OrderFormState } from "@/types/order";
import { orderFormSchema } from "@/validations/order-validation";
import z from "zod";

export async function createOrder(
  prevState: OrderFormState,
  formData: FormData,
) {
  const validatedFields = orderFormSchema.safeParse({
    customer_name: formData.get("name"),
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
