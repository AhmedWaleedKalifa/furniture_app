const cloudinary = require('../config/cloudinary');

async function deleteFromCloudinaryByUrl(url) {
  // Extract public_id from the URL
  const matches = url.match(/\/product_thumbnails\/([^./]+)\./);
  if (!matches) throw new Error('Invalid Cloudinary URL');
  const publicId = `product_thumbnails/${matches[1]}`;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

module.exports = { deleteFromCloudinaryByUrl };
