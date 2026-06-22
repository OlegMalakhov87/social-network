import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useOnline } from '../../../features/users';
import {
  fetchUsersWithFriendshipStatus,
  fetchFriends,
  fetchFriendsOfFriends,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend,
  blockUser,
  normalizeFriend,
} from '../../../entities/friend';

/**
 * Хук для загрузки списка друзей/заявок с фильтрацией.
 * @param {Object} params
 * @param {string} params.filter – 'All', 'Friends', 'Subscribers', 'Subscriptions'
 * @param {string} params.searchQuery – поисковый запрос
 * @returns {{ friends: Array, isLoading: boolean, error: string|null, refetch: Function }}
 */
export function useFriends({ filter, searchQuery } = {}) {
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = useSelector((state) => state.auth.user?.id);

  // Загрузка данных с сервера – зависит только от фильтра
  const loadFriends = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);
    try {
      let result = [];

      if (filter === 'All') {
        const res = await fetchUsersWithFriendshipStatus();
        result = (res.users || []).map((u) => ({
          id: u.id,
          name: u.name,
          nickname: u.nickname,
          photoUrl: u.photoUrl,
          online: u.online,
          age: u.age,
          city: u.address,
          job: u.job,
          status: u.status,
          type: u.friendshipStatus,
          friendshipId: u.friendshipId,
          _friendshipDirection: u.friendshipDirection,
        }));
      } else if (filter === 'Friends') {
        const res = await fetchFriends();
        result = (res.friends || []).map((f) => ({
          id: f.friendId,
          name: f.name,
          nickname: f.nickname,
          photoUrl: f.photoUrl,
          status: f.status,
          job: f.job,
          age: f.age,
          type: 'accepted',
          friendshipId: f.friendshipId,
          _friendshipDirection: f.direction,
        }));
      } else if (filter === 'Friends of friends') {
        const res = await fetchFriendsOfFriends();
        result = (res.users || []).map((u) => ({
          id: u.id,
          name: u.name,
          nickname: u.nickname,
          photoUrl: u.photoUrl,
          status: u.status,
          job: u.job,
          age: u.age,
          type: 'friend of friend',
          friendshipId: null,
          _friendshipDirection: null,
        }));
      } else if (filter === 'Subscribers') {
        const res = await fetchIncomingRequests();
        result = (res.requests || []).map((r) => ({
          id: r.user.id,
          name: r.user.name,
          nickname: r.user.nickname,
          photoUrl: r.user.photoUrl,
          status: r.user.status,
          job: r.user.job,
          age: r.user.age,
          type: r.type,
          friendshipId: r.requestId,
          _friendshipDirection: 'incoming',
        }));
      } else if (filter === 'Subscriptions') {
        const res = await fetchOutgoingRequests();
        result = (res.requests || []).map((r) => ({
          id: r.friend.id,
          name: r.friend.name,
          nickname: r.friend.nickname,
          photoUrl: r.friend.photoUrl,
          status: r.friend.status,
          job: r.friend.job,
          age: r.friend.age,
          type: r.type,
          friendshipId: r.requestId,
          _friendshipDirection: 'outgoing',
        }));
      }

      setRawData(result);
    } catch (err) {
      setError(err.message);
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, filter]);

  // ID пользователей в зависимости от вкладки(фильтра)
  const userIds = useMemo(() => rawData.map((u) => u.id).filter(Boolean), [rawData]);
  const onlineMap = useOnline(userIds);

  const enrichedData = useMemo(
    () =>
      rawData.map((user) => ({
        ...user,
        online: onlineMap.get(user.id) ?? false,
      })),
    [rawData, onlineMap]
  );
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Функция для оптимистического обновления статуса (связи) между пользователями
  const updateFriendStatus = useCallback((userId, updates) => {
    setRawData((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)));
  }, []);

  // Оптимистичные экшены
  const follow = useCallback(
    async (userId) => {
      updateFriendStatus(userId, {
        type: 'pending',
        _friendshipDirection: 'outgoing',
        friendshipId: null,
      });
      try {
        const result = await sendFriendRequest(userId);
        const newFriendshipId = result?.id;
        if (newFriendshipId) {
          updateFriendStatus(userId, { friendshipId: newFriendshipId });
        }
      } catch (error) {
        updateFriendStatus(userId, { type: null, _friendshipDirection: null, friendshipId: null });
        setError(error.message);
      }
    },
    [updateFriendStatus]
  );

  const unfollow = useCallback(
    async (friendshipId, userId) => {
      updateFriendStatus(userId, {
        type: null,
        _friendshipDirection: null,
        friendshipId: null,
      });
      try {
        await rejectFriendRequest(friendshipId);
      } catch (error) {
        loadFriends();
        setError(error.message);
      }
    },
    [updateFriendStatus, loadFriends]
  );

  const accept = useCallback(
    async (friendshipId, userId) => {
      updateFriendStatus(userId, {
        type: 'accepted',
        _friendshipDirection: 'incoming',
        friendshipId,
      });
      try {
        await acceptFriendRequest(friendshipId);
      } catch (error) {
        loadFriends();
        setError(error.message);
      }
    },
    [updateFriendStatus, loadFriends]
  );

  const block = useCallback(
    async (userId) => {
      updateFriendStatus(userId, {
        type: 'blocked',
        _friendshipDirection: 'incoming',
        friendshipId: null,
      });
      try {
        const result = await blockUser(userId);
        const newFriendshipId = result?.friendship?.id;
        if (newFriendshipId) {
          updateFriendStatus(userId, { friendshipId: newFriendshipId });
        }
      } catch (error) {
        loadFriends();
        setError(error.message);
      }
    },
    [updateFriendStatus, loadFriends]
  );

  const unlock = useCallback(
    async (friendshipId, userId) => {
      updateFriendStatus(userId, {
        type: null,
        _friendshipDirection: null,
        friendshipId: null,
      });
      try {
        await deleteFriend(friendshipId);
      } catch (error) {
        loadFriends();
        setError(error.message);
      }
    },
    [updateFriendStatus, loadFriends]
  );

  // Фильтрация по поиску (на клиенте) – не зависит от загрузки
  const filteredData = useMemo(() => {
    if (!searchQuery?.trim()) return enrichedData;
    const q = searchQuery.trim().toLowerCase();
    return enrichedData.filter((u) => (u.name || '').toLowerCase().includes(q));
  }, [enrichedData, searchQuery]);

  // Нормализация под компоненты
  const friends = useMemo(() => filteredData.map(normalizeFriend), [filteredData]);

  return {
    friends,
    isLoading,
    error,
    currentUserId,
    follow,
    unfollow,
    accept,
    block,
    unlock,
    refetch: loadFriends,
  };
}
