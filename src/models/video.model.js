import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from 
"mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        VideoFile: {
            type: String,  //cloudinary url
            required: true
        },

        thumbnail: {
            type: String, //coudinary url
            requied: true
        },

        title:{
            type: String, 
            requied: true
        },

        discription: {
            type: String, 
            requied: true
        },

        duration: {
            type: Number, //cloudinary url 
            requied: true
        },

        views: {
            type: Number,
            default: 0
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }





    },
{timestamps:true}
)


videoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", videoSchema)