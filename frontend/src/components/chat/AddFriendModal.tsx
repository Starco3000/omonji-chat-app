import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '../ui/dialog';
import { UserPlus } from 'lucide-react';
import type { User } from '@/types/user';
import { useFriendStore } from '@/stores/useFriendStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import SearchForm from '../addFriendModal/SearchForm';
import SendFriendRequestForm from '../addFriendModal/SendFriendRequestForm';

export interface IFormValues {
  username: string;
  message: string;
}

const AddFriendModal = () => {
  const [isFound, setIsFound] = useState<boolean | null>(null);
  const [searchUser, setSearchUser] = useState<User>();
  const [searchedUsername, setSearchedUsername] = useState('');
  const { loading, searchByUsername, addFriend } = useFriendStore();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { username: '', message: '' } });

  const usernameValue = watch('username');
  const isCurrentUser = Boolean(
    searchUser &&
    user &&
    (searchUser._id === user._id || searchUser.username === user.username),
  );

  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim();
    if (!username) return;

    setIsFound(null);
    setSearchedUsername(username);

    try {
      const foundUser = await searchByUsername(username);
      if (foundUser) {
        setIsFound(true);
        setSearchUser(foundUser);
      } else {
        setIsFound(false);
      }
    } catch (error) {
      console.error(error);
      setIsFound(false);
    }
  });

  const handleCancel = () => {
    reset();
    setSearchedUsername('');
    setIsFound(null);
  };

  const handleSend = handleSubmit(async (data) => {
    if (!searchUser) return;

    if (isCurrentUser) {
      toast.error('Không thể gửi yêu cầu kết bạn tới chính mình.');
      return;
    }

    try {
      const message = await addFriend(searchUser._id, data.message.trim());
      toast.success(message);
      handleCancel();
    } catch (error) {
      console.error('Error when send request from form', error);
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex justify-center items-center size-5 rounded-full hover:bg-sidebar-accent cursor-pointer z-10'>
          <UserPlus className='size-4.75' />
          <span className='sr-only'>Kết bạn</span>
        </div>
      </DialogTrigger>

      <DialogContent className='sm:max-w-106.25 border-none'>
        <DialogHeader>
          <DialogTitle>Kết bạn</DialogTitle>
        </DialogHeader>

        {!isFound && (
          <>
            <SearchForm
              register={register}
              errors={errors}
              usernameValue={usernameValue}
              loading={loading}
              isFound={isFound}
              searchedUsername={searchedUsername}
              onSubmit={handleSearch}
              onCancel={handleCancel}
            />
          </>
        )}

        {isFound && (
          <>
            <SendFriendRequestForm
              register={register}
              loading={loading}
              searchedUsername={searchedUsername}
              onSubmit={handleSend}
              onBack={() => setIsFound(null)}
            />
          </>
        )}

        {isFound && isCurrentUser ? <>//todo user profile</> : null}
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
