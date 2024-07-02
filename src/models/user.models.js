import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new new Schema({

    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    avatar: {
        type: String, // cludinary url
        required: true,
    },

    coverImage: {
        type: String, //coudinary url
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],

    password: {
        type: String,
        unique: true,
        require: [true, 'Password is required']
    },

    refresToken: {
        type: String
    },
    
},
    {timestamps: true}
)



userSchema.pre("save", function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methids.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password,this.password)
}


export const User = mongoose.model("User", userSchema)