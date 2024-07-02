import mongoose, {Schema} from "mongoose"

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




export const User = mongoose.model("Uaser", userSchema)