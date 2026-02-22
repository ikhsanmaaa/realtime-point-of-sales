"use server";

import { deleteFile, uploadFile } from "@/actions/storage-action";
import { createClient } from "@/lib/supabase/server";
import { MenuFormState } from "@/types/menu";
import { menuSchema } from "@/validations/menu-validations";
import z from "zod";

export async function createMenu(prevState: MenuFormState, formData: FormData) {
  let validatedFields = menuSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price") as string),
    discount: parseFloat(formData.get("discount") as string),
    category: formData.get("category"),
    image_url: formData.get("image_url"),
    is_available: formData.get("is_available") === "true" ? true : false,
  });

  if (!validatedFields.success) {
    const formatted = z.treeifyError(validatedFields.error);

    return {
      errors: {
        name: formatted.properties?.name?.errors,
        description: formatted.properties?.description?.errors,
        price: formatted.properties?.price?.errors,
        discount: formatted.properties?.discount?.errors,
        category: formatted.properties?.category?.errors,
        image_url: formatted.properties?.image_url?.errors,
        is_available: formatted.properties?.is_available?.errors,
        _form: [],
      },
    };
  }

  if (validatedFields.data.image_url instanceof File) {
    const { error, data } = await uploadFile(
      "images",
      "menus",
      validatedFields.data.image_url,
    );

    if (error) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [...error._form],
        },
      };
    }

    validatedFields = {
      ...validatedFields,
      data: {
        ...validatedFields.data,
        image_url: data.url,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("menus").insert({
    name: validatedFields.data.name,
    description: validatedFields.data.description,
    price: validatedFields.data.price,
    discount: validatedFields.data.discount,
    category: validatedFields.data.category,
    image_url: validatedFields.data.image_url,
    is_available: validatedFields.data.is_available,
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

export async function updateMenu(prevState: MenuFormState, formData: FormData) {
  let validatedFields = menuSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price") as string),
    discount: parseFloat(formData.get("discount") as string),
    category: formData.get("category"),
    image_url: formData.get("image_url"),
    is_available: formData.get("is_available") === "true" ? true : false,
  });

  if (!validatedFields.success) {
    const formatted = z.treeifyError(validatedFields.error);

    return {
      errors: {
        name: formatted.properties?.name?.errors,
        description: formatted.properties?.description?.errors,
        price: formatted.properties?.price?.errors,
        discount: formatted.properties?.discount?.errors,
        category: formatted.properties?.category?.errors,
        image_url: formatted.properties?.image_url?.errors,
        is_available: formatted.properties?.is_available?.errors,
        _form: [],
      },
    };
  }

  if (validatedFields.data.image_url instanceof File) {
    const oldImageUrl = formData.get("old_image_url") as string;
    const { error, data } = await uploadFile(
      "images",
      "menus",
      validatedFields.data.image_url,
      oldImageUrl.split("/images/")[1],
    );

    if (error) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [...error._form],
        },
      };
    }

    validatedFields = {
      ...validatedFields,
      data: {
        ...validatedFields.data,
        image_url: data.url,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("menus")
    .update({
      name: validatedFields.data.name,
      description: validatedFields.data.description,
      price: validatedFields.data.price,
      discount: validatedFields.data.discount,
      category: validatedFields.data.category,
      image_url: validatedFields.data.image_url,
      is_available: validatedFields.data.is_available,
    })
    .eq("id", formData.get("id"));

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

export async function deleteMenu(prevState: MenuFormState, formData: FormData) {
  const supabase = await createClient();
  const image = formData.get("image_url") as string;
  const { status, error } = await deleteFile(
    "images",
    image.split("/images/")[1],
  );

  if (status === "error") {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [...(error?._form?.[0] ?? "Unknown error")],
      },
    };
  }

  const { error: errors } = await supabase
    .from("menus")
    .delete()
    .eq("id", formData.get("id"));
  if (errors) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [...errors?.message],
      },
    };
  }

  return {
    status: "success",
  };
}
