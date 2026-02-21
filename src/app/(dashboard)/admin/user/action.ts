"use server";

import { deleteFile, uploadFile } from "@/actions/storage-action";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import {
  createUserSchema,
  updateUserSchema,
} from "@/validations/auth-validation";
import { z } from "zod";

export async function createUser(prevState: AuthFormState, formData: FormData) {
  let validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    const formatted = z.treeifyError(validatedFields.error);

    return {
      errors: {
        email: formatted.properties?.email?.errors,
        password: formatted.properties?.password?.errors,
        name: formatted.properties?.name?.errors,
        role: formatted.properties?.role?.errors,
        avatar_url: formatted.properties?.avatar_url?.errors,
        _form: [],
      },
    };
  }

  if (validatedFields.data.avatar_url instanceof File) {
    const { error, data } = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url,
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
        avatar_url: data.url,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        name: validatedFields.data.name,
        role: validatedFields.data.role,
        avatar_url: validatedFields.data.avatar_url,
      },
    },
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

export async function updateUser(prevState: AuthFormState, formData: FormData) {
  let validatedFields = updateUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    const formatted = z.treeifyError(validatedFields.error);

    return {
      errors: {
        name: formatted.properties?.name?.errors,
        role: formatted.properties?.role?.errors,
        avatar_url: formatted.properties?.avatar_url?.errors,
        _form: [],
      },
    };
  }

  if (validatedFields.data.avatar_url instanceof File) {
    const oldAvatarUrl = formData.get("old_avatar_url") as string;

    const { error, data } = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url,
      oldAvatarUrl.split("/images/")[1],
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
        avatar_url: data.url,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      name: validatedFields.data.name,
      role: validatedFields.data.role,
      avatar_url: validatedFields.data.avatar_url,
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

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient({ isAdmin: true });
  const image = formData.get("avatar_url") as string;
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

  const { error: errors } = await supabase.auth.admin.deleteUser(
    formData.get("id") as string,
  );
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
