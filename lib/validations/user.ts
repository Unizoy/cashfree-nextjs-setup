import * as z from "zod"

export const userNameSchema = z.object({
  name: z.string().min(3).max(32),
  phoneNumber: z.string().min(7).max(20).or(z.literal("")),
})
