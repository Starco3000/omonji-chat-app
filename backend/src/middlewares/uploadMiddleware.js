import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 2, //2MB
  },
});

export const uploadImageFromBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'omonji_chat/avatars', //Chỉ đường dẫn lưu vào folder
        resource_type: 'image', //định dạng là folder ảnh
        transformation: [{ width: 200, height: 200, crop: 'fill' }], // y/c cloudinary điều chỉnh kích thước ảnh khi lưu tránh user upload ảnh quá to hoặc không vuông góc dẫn đến UI méo và load chậm
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
    uploadStream.end(buffer);
  });
};
