import cloudinary from "cloudinary";

export const uploadToCloudinary = async (imageFile: Express.Multer.File) => {
  try {
    const b64 = Buffer.from(imageFile.buffer).toString("base64");
    const dataURI = "data:" + imageFile.mimetype + ";base64," + b64;
    const response = await cloudinary.v2.uploader.upload(dataURI);
    return response.url;
  } catch (error) {
    console.error("Error uploading single file to Cloudinary:", error);
    throw error;
  }
};


export const uploadMultipleToCloudinary = async (imageFiles: Express.Multer.File[]) => {
  try {
    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      const dataURI = "data:" + image.mimetype + ";base64," + b64;
      const response = await cloudinary.v2.uploader.upload(dataURI);
      return response.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error("Error uploading multiple files to Cloudinary:", error);
    throw error;
  }
};

export default uploadMultipleToCloudinary;

