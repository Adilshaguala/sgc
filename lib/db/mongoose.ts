import "server-only"

import mongoose from "mongoose"

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var __mongooseCache__: MongooseCache | undefined
}

const cache = global.__mongooseCache__ ?? {
  conn: null,
  promise: null,
}

global.__mongooseCache__ = cache

function getMongoUri() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI nao definida. Configure a variavel de ambiente para ligar o sistema ao MongoDB."
    )
  }

  return mongoUri
}

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(getMongoUri(), {
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 5000,
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}
