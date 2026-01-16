import type { Participant } from '@/types/chat';
import UserAvatar from './UserAvatar';
import { Ellipsis } from 'lucide-react';

interface GroupChatAvatarProps {
  participants: Participant[];
  type: 'chat' | 'sidebar';
}

const GroupChatAvatar = ({ participants, type }: GroupChatAvatarProps) => {
  const avatars = [];
  const limit = Math.min(participants.length, 4);

  for (let i = 0; i < limit; i++) {
    const memeber = participants[i];
    avatars.push(
      <UserAvatar
        key={i}
        type={type}
        name={memeber.displayName}
        avatarUrl={memeber.avatarUrl ?? undefined}
      />,
    );
  }

  return (
    <div className='relative flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2'>
      {avatars}
      {/* If more than 4 avatar, then render 3 dots */}
      {participants.length > limit && (
        <div className='flex justify-center items-center z-10 size-8 rounded-full bg-muted ring-2 ring-background text-muted-foreground'>
          <Ellipsis className='size-4' />
        </div>
      )}
    </div>
  );
};

export default GroupChatAvatar;
