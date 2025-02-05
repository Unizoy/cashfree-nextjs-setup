import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { userNameSchema } from "@/lib/validations/user"

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error("Unauthorized: No session found")
    }

    const { name, phoneNumber } = await req.json()

    // Validate the request body
    const payload = userNameSchema.parse({ name, phoneNumber })

    // Update the user
    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: payload.name,
        phoneNumber: payload.phoneNumber,
      },
    })

    if (!updatedUser) {
      throw new Error("Failed to update user")
    }

    return NextResponse.json(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(JSON.stringify(error.issues), { status: 422 })
    }

    const message =
      error instanceof Error ? error.message : "Internal server error"
    const status = message.startsWith("Unauthorized")
      ? 401
      : message.startsWith("Forbidden")
        ? 403
        : 500

    return NextResponse.json({ error: message }, { status })
  }
}
