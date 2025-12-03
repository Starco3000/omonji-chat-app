import Logout from '@/components/auth/Logout';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

const ChatAppPage = () => {
  const user = useAuthStore((data) => data.user);

  const handleOnClick = async () => {
    try {
      await api.get('users/test', { withCredentials: true });
      toast.success('OK');
    } catch (error) {
      console.error(error);
      toast.error('Thất bại');
    }
  };
  return (
    <div>
      {user?.username}
      <Logout />

      <Button onClick={handleOnClick}>test</Button>
    </div>
  );
};

export default ChatAppPage;
