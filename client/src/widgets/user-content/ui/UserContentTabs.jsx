import { PostsTab } from '../index';
import { PhotosTab } from '../index';
import { TracksTab } from '../index';
import { VideosTab } from '../index';

/**
 * Объект с вкладками контента пользователя.
 * Используется в ProfilePage для отрисовки выбранной вкладки.
 */
export const UserContentTabs = {
  Posts: PostsTab,
  Photos: PhotosTab,
  Tracks: TracksTab,
  Videos: VideosTab,
};
