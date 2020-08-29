import mongoose from 'mongoose';
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        index: {
            unique: true,
            collation: { locale: "en", strength: 2 }
        },
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        index: true,
        trim: true,
        required: true,
        select: false
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    bubbleColor: String,
    textColor: String,
    createdAt: Date
})

userSchema.pre("save", async function () {
    const date = new Date()

    if (this.isNew) this.createdAt = date
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
})

export default mongoose.models.User || mongoose.model("User", userSchema)