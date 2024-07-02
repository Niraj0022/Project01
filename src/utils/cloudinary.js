import{v2 as cloudinary} from "cloudinary"
import fs from "fs"


    
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary = async(localFilePath) =>{
        try{
            if (!localFilePath) return null
            //upload the the files on cloudinary
            const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type:"auto"
            })
            //file has been uplpaded successfully
            console.log("file is uploaded on cloudinary", 
            response.url);
            return response;

        }catch(error){
            fs.unlinkSync(localFilePath) //removes the localy saved 
            //temp files as the upload operaation failes
            return null;

        }
    }


   export {uploadOnCloudinary}