import express from 'express'
import User from "../models/user.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const router = express.Router()

const expirationDuration = "1d"

router.post("/signup", async (req, res) => {
    const { username, email, password, bubbleColor, textColor } = req.body

    // save user in the database
    const user = new User({ username, email, password, bubbleColor, textColor })
    const savedUser = await user.save()

    // send access token
    const payload = { id: savedUser._id, username: savedUser.username, bubbleColor: savedUser.bubbleColor, textColor: savedUser.textColor }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expirationDuration })

    res.status(200).json({ accessToken })
})

router.post("/login", async (req, res) => {
    const { username, password } = req.body

    // find user and check if password is valid
    const user = await User.findOne({ username }).select("+password").exec()
    if (!user) return
    const isPasswordValid = bcrypt.compare(password, user.password)
    if (!isPasswordValid) return

    // generate access token
    const payload = { id: user._id, username: user.username, bubbleColor: user.bubbleColor, textColor: user.textColor }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expirationDuration })

    res.status(200).json({ accessToken })
})

export default router