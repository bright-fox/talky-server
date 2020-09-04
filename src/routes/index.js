import express from "express"
import { asyncHandler } from "../util"
import Chatroom from "../models/chatroom"

const router = express.Router()

router.get("/rooms/:roomname/members", asyncHandler(async (req, res) => {
    const members = await Chatroom.find({ roomName: req.params.roomname }).distinct("username").exec()
    res.status(200).json({ members })
}))

export default router