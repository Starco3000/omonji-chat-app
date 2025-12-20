import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//Tạo logic trước khi save là user nào có id nhỏ nhất sẽ xếp trước
friendSchema.pre('save', function (next) {
  const a = this.userA.toString();
  const b = this.userB.toString();

  if (a > b) {
    this.userA = new mongoose.Types.ObjectId(b);
    this.userB = new mongoose.Types.ObjectId(a);
  }

  next();
});

friendSchema.index({ userA: 1, userB: 1 }, { unique: true }); //Đảm bảo 2 cặp Friend user này là duy nhất, tránh trùng lặp

const Friend = mongoose.model('Friend', friendSchema);

export default Friend;
