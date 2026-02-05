import { cn, formatMessageTime } from '@/lib/utils';
import type { Conversation, Message, Participant } from '@/types/chat';
import UserAvatar from './UserAvatar';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: 'delivered' | 'seen';
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const prev = messages[index - 1];

  const isGroupBreak =
    index === 0 || //Nếu là tin đầu tiên thì tách nhóm
    message.senderId !== prev?.senderId || //Nếu tin nhắn mới khác người gửi của tin trước thì tách nhóm
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() > // Cách 1 khoảng thời gian nhất định thì mới tách nhóm với cùng 1 id người
      300000; // 3minutes

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() == message.senderId.toString(),
  );

  return (
    <div
      className={cn(
        'flex gap-2 message-bounce mt-1',
        message.isOwn ? 'justify-end' : 'justify-start',
      )}
    >
      {/* Avatar */}
      {!message.isOwn && (
        <div className='w-8'>
          {isGroupBreak && (
            <UserAvatar
              type='chat'
              name={participant?.displayName ?? 'Moji'}
              avatarUrl={participant?.avatarUrl ?? undefined}
            />
          )}
        </div>
      )}

      {/* Message */}
      <div
        className={cn(
          'max-w-xs lg:max-w-md space-y-1 flex flex-col',
          message.isOwn ? 'items-end' : 'items-start',
        )}
      >
        <Card
          className={cn(
            'p-3',
            message.isOwn
              ? 'chat-bubble-sent border-0'
              : 'bg-chat-bubble-received',
          )}
        >
          <p className='text-sm leading-relaxed break-words'>
            {message.content}
          </p>
        </Card>

        {/* Time */}
        {isGroupBreak && (
          <span className='text-xs text-muted-foreground px-1'>
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

        {/* Seen/ delivered */}
        {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
          <Badge
            variant='outline'
            className={cn(
              'text-xs px-1.5 py-0.5 h-4 border-0',
              lastMessageStatus === 'seen'
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {lastMessageStatus}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
