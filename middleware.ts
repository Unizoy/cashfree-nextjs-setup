import { NextResponse } from "next/server"
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "@/routes"
import NextAuth from "next-auth"

import authConfig from "./lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)

    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    )
  }
  return NextResponse.next()
})

// const isAuth = !!req.cookies.get("next-auth.session-token")
// const isAuthPage =
//   req.nextUrl.pathname.startsWith("/login") ||

//   req.nextUrl.pathname.startsWith("/register")

// if (isAuthPage) {
//   if (isAuth) {
//     return NextResponse.redirect(new URL("/dashboard", req.url))
//   }
//   return null
// }
// if (!isAuth) {
//   let from = req.nextUrl.pathname
//   if (req.nextUrl.search) {
//     from += req.nextUrl.search
//   }
//   return NextResponse.redirect(
//     new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
//   )
// }

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
  // matcher: ["/dashboard/:path*", "/editor/:path*", "/login", "/register"],
}
