import { createSelector } from '@reduxjs/toolkit';
import { filterFriend } from '../../friend';

/**
 * Селектор карты дружбы для текущего пользователя.
 * @returns {Map<number, {status: string, direction: 'incoming'|'outgoing'}>}
 */
export const selectFriendshipMap = createSelector(
  [(state) => state.friends?.friendsData || [], (_, currentUserId) => currentUserId],
  (friendsData, currentUserId) => {
    const map = new Map();
    friendsData.forEach((f) => {
      if (f.userId === currentUserId) {
        map.set(f.friendId, { status: f.status, direction: 'outgoing' });
      } else if (f.friendId === currentUserId) {
        map.set(f.userId, { status: f.status, direction: 'incoming' });
      }
    });
    return map;
  }
);

/**
 * Селектор отфильтрованного списка пользователей с учётом поиска и категории.
 * @param {Object} state
 * @param {number} currentUserId
 * @param {Map} friendshipMap
 * @param {string} searchQuery
 * @param {string} filter
 * @returns {Array}
 */
export const selectFilteredFriends = createSelector(
  [
    (state) => state.users?.usersData || [],
    (state) => state.friends?.friendsData || [],
    (_, currentUserId) => currentUserId,
    (_, __, friendshipMap) => friendshipMap,
    (_, __, ___, searchQuery) => searchQuery,
    (_, __, ___, ____, filter) => filter,
  ],
  (usersData, friendsData, currentUserId, friendshipMap, searchQuery, filter) => {
    if (!usersData?.length || !currentUserId || !(friendshipMap instanceof Map)) return [];
    return filterFriend({
      usersData,
      friendsData,
      currentUserId,
      friendshipMap,
      searchQuery,
      filter,
    });
  }
);
