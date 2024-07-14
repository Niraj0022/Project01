import  { asyncHandler } from "../utils/asyncHandler.js";
import  { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        
        return {accessToken, refreshToken}


    }catch(error){
        throw new apiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    
    // getting user detailes from postman or frontend
    // implement validation - not empty 
    // check user already exist: username or email
    // check for images, check for avatar
    // upload them to cloudinary, avatar 
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullname, email, username, password } = req.body
    // console.log(
    //     "email:", email,
    //     "username:", username,
    //     "fullname:", fullname,
    // );

    if(
        [fullname, email, username, password].some(
        (field) => field?.trim() ==="")
    ){
        throw new apiError(400, "All fiels are required")
    } 

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
        })

        if(existedUser){
            throw new apiError(409, "User with email or username already exist")
        }


        const avatarLocalPath = req.files?.avatar[0]?.path;
        //const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0){
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if(!avatarLocalPath){
            throw new apiError(400,"Avatar file is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        
        if(!avatar){
            throw new apiError(400, " Avatar file is required")
        }

        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url  || "",
            email,
            password,
            username: username.toLowerCase()
        }) 

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new apiError(500, "Something went wrong while creating user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )


})



const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body

    if(!username || !email){
        throw new apiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new apiError(400, "User does not exist")
    }

    const isPasswordvalid = await user.isPasswordcorrect(password)

    if(!isPasswordvalid) {
        throw new apiError(401, "Invalid password credential")
    }

    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
    )

})

logoutUser = asyncHandler(async( req, res) => {
    User.findById
})



export {
    registerUser,
    loginUser
};


