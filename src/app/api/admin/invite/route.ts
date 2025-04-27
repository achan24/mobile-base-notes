import { auth } from "@/auth"
import clientPromise from "@/lib/mongo"
import { resend } from "@/lib/resend"
import crypto from "crypto"
import { add } from "date-fns"

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = await auth() as any
  if (!user || user.role !== "admin")
    return new Response("Forbidden", { status: 403 })

  const { email, role = "user" } = await req.json()
  const db   = (await clientPromise()).db()

  await db.collection("invites").insertOne({
    email, role, issuedBy: user.id, issuedAt: new Date(),
  })

  const token     = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  await db.collection("verificationTokens").insertOne({
    identifier: email,
    token:      tokenHash,
    expires:    add(new Date(), { hours: 24 }),
  })

  const url = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${token}&callbackUrl=/`

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to:   email,
    subject: "You're invited to Noteflow 🚀",
    html:   `<p>Click <a href="${url}">this link</a> to join.</p>`,
  })

  return Response.json({ ok: true })
}
