import { auth } from "@/auth"
import clientPromise from "@/lib/mongo"
import { ObjectId, Db, WithId, Document } from "mongodb"

// Opt into Node runtime explicitly
export const runtime = "nodejs"

type Resource = "users" | "invites"

export async function GET(
  req: Request,
  { params: { resource } }: { params: { resource: Resource } }
) {
  const gate = await adminGate()
  if (!gate.ok) return gate.res

  const { start, end, sort, order } = parseParams(req)
  const { db, col } = await collectionFor(resource)

  const cursor = db.collection(col)
    .find({})
    .sort({ [sort]: order === "ASC" ? 1 : -1 })
    .skip(start)
    .limit(end - start)

  const data: WithId<Document>[] = await cursor.toArray()
  const total = await db.collection(col).countDocuments()

  return json(data, total)
}

export async function POST(req: Request, ctx: { params: { resource: Resource } }) {
  if (ctx.params.resource !== "invites")
    return new Response("Method Not Allowed", { status: 405 })
  return (await import("../invite/route")).POST(req)
}

export async function PUT(req: Request, { params }: { params: { resource: Resource } }) {
  const gate = await adminGate(); if (!gate.ok) return gate.res
  const body = await req.json()
  const { db, col } = await collectionFor(params.resource)

  const { id, ...rest } = body
  await db.collection(col).updateOne({ _id: new ObjectId(id) }, { $set: rest })
  return Response.json(body)
}

export async function DELETE(req: Request, { params }: { params: { resource: Resource } }) {
  const gate = await adminGate(); if (!gate.ok) return gate.res
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return new Response("id required", { status: 400 })
  const { db, col } = await collectionFor(params.resource)
  await db.collection(col).deleteOne({ _id: new ObjectId(id) })
  return Response.json({ id })
}

async function adminGate() {
  const { user } = await auth()
  if (!user || user.role !== "admin")
    return { ok: false, res: new Response("Forbidden", { status: 403 }) }
  return { ok: true }
}

function parseParams(req: Request) {
  const url = new URL(req.url)
  return {
    start: Number(url.searchParams.get("_start") ?? 0),
    end:   Number(url.searchParams.get("_end")   ?? 10),
    sort:  url.searchParams.get("_sort")  ?? "createdAt",
    order: url.searchParams.get("_order") ?? "DESC",
  }
}

async function collectionFor(resource: Resource): Promise<{ db: Db, col: string }> {
  const db: Db = (await clientPromise()).db()
  const col: Resource = resource
  return { db, col }
}

function json(data: WithId<Document>[], total: number) {
  const records = data.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }))
  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json",
      "X-Total-Count": String(total),
    },
  })
}
