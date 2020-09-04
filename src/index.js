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
import indexRoutes from "./routes/index.js"
import { errorMiddleware, loggerMiddleware, errorLoggerMiddleware } from "./middlewares/index.js"
import Chatroom from "./models/chatroom.js"

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
app.use("/", indexRoutes)
app.use("/", authRoutes)

// middlewares
app.use(errorLoggerMiddleware)
app.use(errorMiddleware)

io.on("connection", (socket) => {
    // join chatroom
    socket.on("joinRoom", ({ roomName, accessToken }) => {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) return // maybe emit error
            socket.join(roomName)

            // check if user is already in the room
            const isAlreadyInChatroom = await Chatroom.exists({ roomName, username: user.username })

            // create new member in chatroom for every socket
            const membership = new Chatroom({ roomName, username: user.username, socketID: socket.id })
            const savedMembership = await membership.save()

            // emit new memberlist if it is a new user
            if (isAlreadyInChatroom) return
            const members = await Chatroom.distinct("username", { roomName }).exec()
            // io.to(roomName).emit("userJoined", { username: user.username })
            io.to(roomName).emit("updateMembers", { members })
        })
    })

    // handle sent messages
    socket.on("chatMessage", ({ message, accessToken }) => {
        // check if accesstoken is valid
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) return // maybe it will close the connection

            const msg = { text: message, time: new Date().toISOString(), user }
            io.emit("message", msg) // socket.broadcast to exclude the person
        })
    })
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})