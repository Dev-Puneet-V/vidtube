import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME + "",
  api_key: process.env.CLOUDINARY_API_KEY + "",
  api_secret: process.env.CLOUDINARY_API_SECRET + "",
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded on cloudinary. File src" + response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from cloudinary, public id", publicId);
  } catch (error) {
    console.log("Error deleting from cloudinary", error);
    return null;
  }
};

export const getPublicIdFromUrl = async (url) => {
  try {
    const parts = url.split("/");
    const fileNameWithExtension = parts[parts.length - 1];
    const publicId = fileNameWithExtension.split(".")[0];
    return publicId;
  } catch (error) {
    return null;
  }
};
