import Redis from "ioredis"

const redis = new Redis({
    host: process.env.NODE_ENV === "development" ? "127.0.0.1" : "redis",
    port: 6379,
    password: "JJX*EMMqeeh!78QQ!BD"
})

export default redis
