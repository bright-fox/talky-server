import express from 'express'
import User from "../models/user.js"

const router = express.Router()

router.post("/signup", async (req, res) => {
    const { username, email, password, bubbleColor, textColor } = req.body

    // save user in the database
    const user = new User({ username, email, password, bubbleColor, textColor })
    const savedUser = await user.save()

    res.status(200).json({ user: savedUser })
})

export default router