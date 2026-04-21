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

// // Middleware cho upload media (ảnh và video) trong chat
// export const uploadMedia = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 1024 * 1024 * 10, // 10MB cho video
//   },
//   fileFilter: (req, file, cb) => {
//     // Chỉ cho phép ảnh và video
//     if (
//       file.mimetype.startsWith('image/') ||
//       file.mimetype.startsWith('video/')
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error('Chỉ cho phép upload ảnh hoặc video'), false);
//     }
//   },
// });

// // Hàm upload ảnh cho chat (không resize để giữ chất lượng)
// export const uploadImageForChat = (buffer, options) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: 'omonji_chat/images',
//         resource_type: 'image',
//         ...options,
//       },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       },
//     );
//     uploadStream.end(buffer);
//   });
// };

// // Hàm upload video cho chat
// export const uploadVideoForChat = (buffer, options) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: 'omonji_chat/videos',
//         resource_type: 'video',
//         ...options,
//       },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       },
//     );
//     uploadStream.end(buffer);
//   });
// };

// // Hàm chung để upload media dựa trên type
// export const uploadMediaForChat = (buffer, mimetype, options = {}) => {
//   if (mimetype.startsWith('image/')) {
//     return uploadImageForChat(buffer, options);
//   } else if (mimetype.startsWith('video/')) {
//     return uploadVideoForChat(buffer, options);
//   } else {
//     throw new Error('Unsupported media type');
//   }
// };