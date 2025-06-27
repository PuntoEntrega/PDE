// src/lib/redis.ts
import Redis from "ioredis"

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.NODE_ENV === "development" ? "127.0.0.1" : "redis",
      port: 6379,
      password: "JJX*EMMqeeh!78QQ!BD",
    })
  }
  return redis
}
