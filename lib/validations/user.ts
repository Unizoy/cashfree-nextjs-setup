import * as z from "zod"

export const userNameSchema = z.object({
  name: z.string().min(3).max(32),
  phoneNumber: z
    .string()
    .regex(
      /^\+?\d{10,14}$/,
      "Phone number must be between 10-14 digits with optional '+' prefix"
    )
    .or(z.literal("")),
})
