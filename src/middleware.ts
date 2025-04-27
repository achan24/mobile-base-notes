import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth(req => {
  const user = req.auth?.user
  const p = req.nextUrl.pathname
  if (!user && p.startsWith("/admin"))
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  if (p.startsWith("/admin") && user?.role !== "admin")
    return NextResponse.redirect(new URL("/", req.nextUrl))
})
