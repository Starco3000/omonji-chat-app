import { useThemeStore } from '@/stores/useThemeStore';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Smile } from 'lucide-react';
// import Picker from '@emoji-mart/react';
// import data from '@emoji-mart/data';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

const EmojiPickerComponent = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger className='cursor-pointer'>
        <Smile className='size-4' />
      </PopoverTrigger>

      <PopoverContent
        side='right'
        sideOffset={40}
        className='bg-transparent border-none shadow-none drop-shadow-none mb-12'
      >
        {/* <Picker
          theme={isDark ? 'dark' : 'light'}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          emojiSize={24}
        /> */}
        <EmojiPicker
          onEmojiClick={(emojiData: any) => onChange(emojiData.emoji)}
          theme={isDark ? Theme.DARK : Theme.LIGHT}
          emojiStyle={EmojiStyle.GOOGLE}
          width={400}
          height={450}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPickerComponent;
