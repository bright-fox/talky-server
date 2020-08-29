import express from 'express'
import User from "../models/user.js"
import jwt from "jsonwebtoken"

const router = express.Router()

router.post("/signup", async (req, res) => {
    const { username, email, password, bubbleColor, textColor } = req.body

    // save user in the database
    const user = new User({ username, email, password, bubbleColor, textColor })
    const savedUser = await user.save()

    // send access token
    const payload = { id: savedUser._id, username: savedUser.username, bubbleColor: savedUser.bubbleColor, textColor: savedUser.textColor }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" })

    res.status(200).json({ user: savedUser, accessToken })
})

export default router