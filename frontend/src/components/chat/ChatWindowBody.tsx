import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import MessageItem from './MessageItem';

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessage,
  } = useChatStore();

  const messages = allMessage[activeConversationId!]?.items ?? [];

  const selectedConvo = conversations.find(
    (convo) => convo._id === activeConversationId,
  );

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className='flex items-center justify-center h-full text-muted-foreground'>
        Chưa có tin nhắn nào trong cuộc trò chuyện này
      </div>
    );
  }

  return (
    <div className='p-4 bg-primary-foreground h-full flex flex-col overflow-hidden'>
      <div className='flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar'>
        {messages.map((message, index) => (
          <MessageItem
            key={message._id ?? index}
            message={message}
            index={index}
            messages={messages}
            selectedConvo={selectedConvo}
            lastMessageStatus='delivered'
          />
        ))}
      </div>
    </div>
  );
};

export default ChatWindowBody;
