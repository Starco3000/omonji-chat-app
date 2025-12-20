export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId,
) => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((person) => {
    const memberId = person.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    console.log(prevCount);
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};
