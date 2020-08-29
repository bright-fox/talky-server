import express from 'express'
import User from "../models/user.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import _ from "lodash"
import CustomError from '../util/CustomError.js'

const router = express.Router()

const expirationDuration = "1d"

router.post("/signup", asyncHandler(async (req, res) => {
    const { username, email, password, bubbleColor, textColor } = req.body

    // save user in the database
    const user = new User({ username, email, password, bubbleColor, textColor })
    const savedUser = await user.save()

    // send access token
    const payload = { id: savedUser._id, username: savedUser.username, bubbleColor: savedUser.bubbleColor, textColor: savedUser.textColor }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expirationDuration })

    res.status(200).json({ user: payload, accessToken })
}))

router.post("/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body

    // find user and check if password is valid
    const user = await User.findOne({ username }).select("+password").exec()
    if (!user) throw new CustomError(404, "user not found")
    const isPasswordValid = bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new CustomError(403, "wrong password")

    // generate access token
    const payload = { id: user._id, username: user.username, bubbleColor: user.bubbleColor, textColor: user.textColor }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: expirationDuration })

    res.status(200).json({ user: payload, accessToken })
}))

export default router