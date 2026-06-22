import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectDialogPartners,
  selectDialogsData,
  selectCurrentUserId,
  getLastMessageForUser,
} from '../../../entities/dialog';

/**
 * Хук получения отфильтрованных диалогов.
 * @param {Object} params
 * @param {string} [params.searchQuery] - поисковый запрос по имени
 * @returns {{ dialogs: Array<{user, lastMessage}>, isLoading: boolean }}
 */
export const useDialogsFilter = ({ searchQuery }) => {
  const partners = useSelector(selectDialogPartners);
  const dialogsData = useSelector(selectDialogsData);
  const currentUserId = useSelector(selectCurrentUserId);

  const filtered = useMemo(() => {
    if (!searchQuery?.trim()) return partners;
    const s = searchQuery.trim().toLowerCase();
    return partners.filter((user) => user.name?.toLowerCase().includes(s));
  }, [partners, searchQuery]);

  const enriched = useMemo(() => {
    return filtered.map((user) => ({
      user,
      lastMessage: getLastMessageForUser(dialogsData, user.id, currentUserId),
    }));
  }, [filtered, dialogsData, currentUserId]);

  return { dialogs: enriched, isLoading: false };
};
