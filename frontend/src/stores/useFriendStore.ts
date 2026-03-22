import { friendService } from '@/services/friendService';
import type { FriendState } from '@/types/store';
import { create } from 'zustand';

export const userFriendStore = create<FriendState>((set, get) => ({
  loading: false,
  searchByUsername: async (username) => {
    try {
      set({ loading: true });
      const user = await friendService.searchByUsername(username);
      return user;
    } catch (error) {
      console.error('Error when find user by username', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  addFriend: async (to, message) => {
    try {
      set({ loading: true });
      const resultMessage = await friendService.sendFriendRequest(to, message);
      return resultMessage;
    } catch (error) {
      console.error('Error when addFriend', error);
      return 'Error when send friend request. Please try again later!';
    } finally {
      set({ loading: false });
    }
  },
}));
