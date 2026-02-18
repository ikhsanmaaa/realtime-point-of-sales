import z from "zod";

export const loginSchemaForm = z.object({
  email: z.email("Please enter a valid email").min(1, "Email is required"),
  password: z.string().min(1, "Password  is required"),
});

export type LoginForm = z.infer<typeof loginSchemaForm>;
