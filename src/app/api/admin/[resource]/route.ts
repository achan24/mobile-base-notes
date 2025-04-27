import { auth } from "@/auth"
import clientPromise from "@/lib/mongo"
import { ObjectId, Db, WithId, Document } from "mongodb"

// Opt into Node runtime explicitly
export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: { resource: string } }
) {
  const { resource } = params
  if (resource !== "users" && resource !== "invites")
    return new Response("Not found", { status: 404 })

  const gate = await adminGate()
  if (!gate.ok) return gate.res

  const { start, end, sort, order } = parseParams(req)
  const db: Db = (await clientPromise()).db()
  const col = db.collection(resource)

  const cursor = col
    .find({})
    .sort({ [sort]: order === "ASC" ? 1 : -1 })
    .skip(start)
    .limit(end - start)

  const data: WithId<Document>[] = await cursor.toArray()
  const total = await col.countDocuments()

  return json(data, total)
}

export async function POST(req: Request, { params }: { params: { resource: string } }) {
  if (params.resource !== "invites")
    return new Response("Method Not Allowed", { status: 405 })
  return (await import("../invite/route")).POST(req)
}

export async function PUT(req: Request, { params }: { params: { resource: string } }) {
  const gate = await adminGate(); if (!gate.ok) return gate.res
  const body = await req.json()
  const db: Db = (await clientPromise()).db()
  const col = db.collection(params.resource)

  const { id, ...rest } = body
  await col.updateOne({ _id: new ObjectId(id) }, { $set: rest })
  return Response.json(body)
}

export async function DELETE(req: Request, { params }: { params: { resource: string } }) {
  const gate = await adminGate(); if (!gate.ok) return gate.res
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return new Response("id required", { status: 400 })
  const db: Db = (await clientPromise()).db()
  const col = db.collection(params.resource)
  await col.deleteOne({ _id: new ObjectId(id) })
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

function json(data: WithId<Document>[], total: number) {
  const records = data.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }))
  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json",
      "X-Total-Count": String(total),
    },
  })
}
