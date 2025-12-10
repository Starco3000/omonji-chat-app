import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    message: {
      type: String,
      maxLength: 500,
    },
  },
  {
    timestamps: true,
  },
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true }); ///Đảm bảo cặp from và to là duy nhất, nếu gửi lại lời mời kết bạn thì sẽ báo lỗi

friendRequestSchema.index({ from: 1 }); //Truy vấn nhanh các lời mời kết bạn đã gửi

friendRequestSchema.index({ to: 1 }); // Truy vấn nhanh các lời mời kết bạn đã nhận

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;
