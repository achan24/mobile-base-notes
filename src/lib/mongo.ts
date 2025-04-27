import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!
const globalForMongo = global as unknown as { mongo?: MongoClient }

export default async function clientPromise() {
  if (!globalForMongo.mongo) {
    globalForMongo.mongo = new MongoClient(uri)
    await globalForMongo.mongo.connect()
  }
  return globalForMongo.mongo
}
