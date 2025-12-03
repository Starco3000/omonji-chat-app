import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken(accessToken) {
    set({ accessToken });
  },

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
      get().setAccessToken(accessToken);
      await get().fetchUser(); // Load get user data after Login
      toast.success('Chào mừng bạn quay trở lại!');
    } catch (error) {
      console.error(error);
      toast.error('Đăng nhập không thành ');
    } finally {
      set({ loading: false });
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

  fetchUser: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchUser();
      set({ user });
    } catch (error) {
      console.error(error);
      set({ user: null, accessToken: null });
      toast.error(
        'Lỗi xảy ra khi lấy dữ liệu người dùng. Xin hãy thử lại sau!',
      );
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchUser, setAccessToken } = get();
      const accessToken = await authService.refresh();

      setAccessToken(accessToken);

      if (!user) {
        await fetchUser();
      }
    } catch (error) {
      console.error(error);
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));
