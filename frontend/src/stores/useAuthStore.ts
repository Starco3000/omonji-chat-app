import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  //Re-use store when user logout or token expired
  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (username, password, email, firstName, lastnName) => {
    try {
      set({ loading: true });
      // Call API
      await authService.signUp(username, password, email, firstName, lastnName);

      toast.success(
        'Đăng ký thành công! Bạn sẽ được chuyển tới trang đăng nhập.',
      );
    } catch (error) {
      console.error(error);
      toast.error('Đăng ký không thành công');
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });
      const { accessToken } = await authService.signIn(username, password);
      set({ accessToken });
      toast.success('Chào mừng bạn quay trở lại!');
    } catch (error) {
      //   set({ loading: false });
      console.error(error);
      toast.error('Đăng nhập không thành ');
    }
  },

  signOut: async () => {
    try {
      get().clearState(), await authService.signOut();
      toast.success('Đăng xuất thành công');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi xảy ra khi logout. Xin hãy thử lại sau');
    }
  },
}));
