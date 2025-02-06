"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { userNameSchema } from "@/lib/validations/user"
import { toast } from "@/hooks/use-toast"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, "id" | "name"> & { phoneNumber?: string }
}

type FormData = z.infer<typeof userNameSchema>

export function UserNameForm({ user, className, ...props }: UserNameFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userNameSchema),
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    },
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  const watchName = watch("name")
  const watchPhone = watch("phoneNumber")

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    const response = await fetch(`/api/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        phoneNumber: data.phoneNumber,
      }),
    })

    setIsSaving(false)
    const nameChanged = watchName !== user.name
    const phoneChanged = watchPhone !== user.phoneNumber
    const fieldChanged =
      nameChanged && phoneChanged
        ? "information"
        : nameChanged
          ? "name"
          : "phone number"

    if (!response?.ok) {
      // Determine which field was modified

      return toast({
        title: `Your ${fieldChanged} was not updated. Please try again.`,
        variant: "destructive",
      })
    }

    toast({
      title: `Your ${fieldChanged} has been updated.`,
    })

    router.refresh()
  }
  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>My Account</CardTitle>
          <CardDescription>
            Manage your account settings and set your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <Label className="" htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                className="w-[400px]"
                size={32}
                {...register("name")}
              />
              {errors?.name && (
                <p className="px-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label className="" htmlFor="phoneNumber">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                className="w-[400px]"
                size={32}
                {...register("phoneNumber")}
              />
              {errors?.phoneNumber && (
                <p className="px-1 text-xs text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <button
            type="submit"
            className={cn(buttonVariants(), className)}
            disabled={isSaving}
          >
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>Save</span>
          </button>
        </CardFooter>
      </Card>
    </form>
  )
}
