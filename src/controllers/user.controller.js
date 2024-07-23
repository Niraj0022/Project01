import  { asyncHandler } from "../utils/asynchandler.js"
import  { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

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

    const {fullname, email, username, password } = req.body
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

    if(!username && !email){
        throw new apiError(400, "username or password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new apiError(400, "User does not exist")
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

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

const logoutUser = asyncHandler(async( req, res) => {
    await User.findByIdAndDelete(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

        
})


const refreshAccessToken = asyncHandler(async(req, res) =>
    {
    const incomingRefreshToken = req.cookies.
    refreshToken || req.body.refreshToken

    if(incomingRefreshToken) {
        throw new apiError(401, "unautherized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new apiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
    
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken:newRefreshToken},
                "Access token successfull"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message ||
            "invalid refresh token"
        )
    }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};


