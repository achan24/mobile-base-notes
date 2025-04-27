import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongo"
import ResendProvider from "next-auth/providers/resend"

export const { handlers, auth } = NextAuth({
  adapter: MongoDBAdapter(await clientPromise()),
  session: { strategy: "database" },
  providers: [ ResendProvider({}) ],
})
