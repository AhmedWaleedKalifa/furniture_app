const cloudinary = require("../config/cloudinary");
const path = require('path');

async function deleteFromCloudinaryByUrl(url) {
  // Extract public_id from the URL
  const matches = url.match(/\/product_thumbnails\/([^./]+)\./);
  if (!matches) throw new Error("Invalid Cloudinary URL");
  const publicId = `product_thumbnails/${matches[1]}`;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
async function upload3DModelToCloudinary(buffer, originalname) {
    return new Promise((resolve, reject) => {
      const ext = path.extname(originalname); // e.g., '.glb'
      const baseName = path.basename(originalname, ext); // e.g., 'chair'
      const publicId = `${baseName}${ext}`; // e.g., 'chair.glb'
  
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'product_models',
          resource_type: 'raw',
          public_id: publicId, // This ensures the extension is included!
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(buffer);
    });
  }
module.exports = { upload3DModelToCloudinary, deleteFromCloudinaryByUrl };
