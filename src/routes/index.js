import express from "express"
import { asyncHandler } from "../util/index.js"
import Chatroom from "../models/chatroom.js"

const router = express.Router()

router.get("/rooms/:roomname/members", asyncHandler(async (req, res) => {
    const members = await Chatroom.find({ roomName: req.params.roomname }).distinct("username").exec()
    res.status(200).json({ members })
}))

export default router