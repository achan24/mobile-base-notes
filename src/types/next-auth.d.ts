/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    /** custom role you attach in callbacks / DB */
    role?: "admin" | "user" | string
  }

  interface Session {
    user?: User
  }

  /** (optional) If you’re using next-auth middleware helpers */
  interface NextAuthRequest {
    auth?: Session
  }
}
