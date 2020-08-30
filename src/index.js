import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import cors from "cors"
import http from "http"
import jwt from "jsonwebtoken"
import socketIO from "socket.io"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import authRoutes from "./routes/auth.js"
import { errorMiddleware, loggerMiddleware, errorLoggerMiddleware } from "./middlewares/index.js"

// use environment variables from .env
dotenv.config()

const PORT = process.env.PORT || 4001

const app = express()

// socket configurations
const server = http.createServer(app)
const io = socketIO(server)

// MongoDB connection
mongoose.connect(process.env.DB_URI || "mongodb://localhost:27017/talky_api", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
mongoose.set("useFindAndModify", false)

app.use(bodyParser.json())
app.use(cors({
    origin: "http://localhost:3000"
}))

app.use(loggerMiddleware)

// routes
app.use("/", authRoutes)

// middlewares
app.use(errorLoggerMiddleware)
app.use(errorMiddleware)

io.on("connection", (socket) => {
    socket.on("chatMessage", ({ message, accessToken }) => {
        // check if accesstoken is valid
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => { // change into async await syntax
            if (err) return // maybe it will close the connection

            console.log(payload)
            const msg = { text: message, time: new Date().toISOString(), user: payload }
            io.emit("message", msg) // socket.broadcast to exclude the person
        })

    })
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})