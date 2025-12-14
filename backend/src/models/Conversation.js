import mongoose from 'mongoose';

const participantSChema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false, /// Khai báo đây là bảng tạm, không cần tạo Id
  },
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    _id: false, /// Khai báo đây là bảng tạm, không cần tạo Id
  },
);

const lastMessageSchema = new mongoose.Schema(
  {
    _id: { type: String },
    content: {
      type: String,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false, /// Khai báo đây là bảng tạm, không cần tạo Id
  },
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    participants: {
      type: [participantSChema],
      required: true,
    },
    group: {
      type: groupSchema,
    },
    lastMessageAt: {
      type: Date,
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    //Thể hiện tin nhắn cuối của cuộc hội thoại
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    unreadCountes: {
      type: Map, // Lưu số tin nhắn chưa đọc từng User
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

//Tạo 1 bảng tra cứu nhanh với dữ liệu sắp xếp theo người tham gia
//Tin nhắn mới nhất sẽ được đưa lên đầu
conversationSchema.index({
  'participant.userId': 1,
  lastMessageAt: -1,
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
