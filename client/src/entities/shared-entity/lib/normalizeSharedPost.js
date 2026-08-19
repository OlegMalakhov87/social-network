/**
 * Нормализует объект поста для SharedEntityCard / sessionStorage.
 */
export const normalizeSharedPost = (post) => ({
  id: post.id,
  type: 'post',
  author: post.author || null,
  title: post.title || null,
  text: post.text || null,
  mediaUrl: post.media ?? post.mediaUrl ?? null,
  mediaType: post.type ?? post.postType ?? null,
  date: post.date ?? post.updatedAt ?? post.createdAt ?? null,
  stats: {
    likesCount: post.likesCount ?? 0,
    commentsCount: post.commentsCount ?? 0,
  },
});
