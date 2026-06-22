import { createSlice } from '@reduxjs/toolkit';

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friendsData: [
      { userId: 1, friendId: 8, status: 'blocked' },
      { userId: 8, friendId: 2, status: 'accepted' },
      { userId: 3, friendId: 8, status: 'pending' },
      { userId: 8, friendId: 4, status: 'accepted' },
      { userId: 5, friendId: 8, status: 'accepted' },
      { userId: 6, friendId: 3, status: 'accepted' },
      { userId: 7, friendId: 8, status: 'accepted' },
      { userId: 11, friendId: 9, status: 'accepted' },
      { userId: 10, friendId: 9, status: 'accepted' },
      { userId: 10, friendId: 11, status: 'accepted' },
      { userId: 11, friendId: 5, status: 'pending' },
      { userId: 2, friendId: 10, status: 'accepted' },
      { userId: 5, friendId: 9, status: 'accepted' },
      { userId: 4, friendId: 10, status: 'blocked' },
      { userId: 6, friendId: 10, status: 'pending' },
      { userId: 8, friendId: 11, status: 'blocked' },
      { userId: 8, friendId: 6, status: 'pending' },
    ],
    status: 'idle',
    error: null,
  },
  reducers: {
    /** Добавить в друзья */
    followFriend(state, action) {
      const { targetUserId, currentUserId } = action.payload;
      //  Проверяем и удаляем существующие связи если есть
      state.friendsData = state.friendsData.filter(
        (f) =>
          !(
            (f.userId === currentUserId && f.friendId === targetUserId) ||
            (f.userId === targetUserId && f.friendId === currentUserId)
          )
      );
      const newId =
        state.friendsData.length > 0 ? Math.max(...state.friendsData.map((f) => f.id)) + 1 : 1;
      state.friendsData.push({
        id: newId,
        userId: currentUserId,
        friendId: targetUserId,
        status: 'pending',
      });
    },
    /** Отменить заявку в друзья */
    unfollowFriend(state, action) {
      const { targetUserId, currentUserId } = action.payload;
      state.friendsData = state.friendsData.filter(
        (f) => !(f.userId === currentUserId && f.friendId === targetUserId)
      );
    },
    /** Принять заявку в друзья */
    acceptFriendRequest(state, action) {
      const { currentUserId, targetUserId } = action.payload;
      const friendship = state.friendsData.find(
        (f) => f.userId === targetUserId && f.friendId === currentUserId
      );
      if (friendship && friendship.status === 'pending') {
        friendship.status = 'accepted';
      }
    },
    /** Разблокировать пользователя (добавить в друзья) */
    unlockFriendRequest(state, action) {
      const { currentUserId, targetUserId } = action.payload;
      const friendship = state.friendsData.find(
        (f) => f.userId === targetUserId && f.friendId === currentUserId
      );
      if (friendship && friendship.status === 'blocked') {
        friendship.status = 'accepted';
      }
    },
    /** Заблокировать друга (удалить из друзей) */
    blockFriend(state, action) {
      const { targetUserId, currentUserId } = action.payload;
      const existing = state.friendsData.find(
        (f) =>
          (f.userId === currentUserId && f.friendId === targetUserId) ||
          (f.userId === targetUserId && f.friendId === currentUserId)
      );

      if (existing) {
        existing.userId = targetUserId;
        existing.friendId = currentUserId;
        existing.status = 'blocked';
      } else {
        const newId =
          state.friendsData.length > 0 ? Math.max(...state.friendsData.map((f) => f.id)) + 1 : 1;
        state.friendsData.push({
          id: newId,
          userId: targetUserId,
          friendId: currentUserId,
          status: 'blocked',
        });
      }
    },
  },
});

export const {
  followFriend,
  unfollowFriend,
  acceptFriendRequest,
  unlockFriendRequest,
  blockFriend,
} = friendsSlice.actions;

export default friendsSlice.reducer;
