import mongoose from "mongoose"

const chatroomSchema = new mongoose.Schema({
    roomName: String,
    username: String,
    socketID: {
        type: String,
        select: false
    }
})

chatroomSchema.index({ roomName: 1, username: 1, socketID: 1 })

export default mongoose.models.Chatroom || mongoose.model("Chatroom", chatroomSchema)