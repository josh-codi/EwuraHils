import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")
  const isLogin = pathname === "/admin/login"
  const isLoggedIn = !!req.auth

  if (isAdminRoute && !isLogin && !isLoggedIn) {
    const url = new URL("/admin/login", req.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }
  if (isLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}