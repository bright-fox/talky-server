import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import http from "http"
import socketIO from "socket.io"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import authRoutes from "./routes/auth.js"

const PORT = process.env.PORT || 4001

const app = express()

// socket configurations
const server = http.createServer(app)
const io = socketIO(server)

// MongoDB connection
mongoose.connect(process.env.DB_URI || "mongodb://localhost:27017/talky_api", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
mongoose.set("useFindAndModify", false);

// middlewares
app.use(bodyParser.json())

// routes
app.use("/", authRoutes)

io.on("connection", (socket) => {
    socket.on("chatMessage", msg => {
        io.emit("message", msg) // socket.broadcast to exclude the person
    })
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})