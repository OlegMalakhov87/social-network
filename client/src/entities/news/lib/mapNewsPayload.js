/**
 * Поля формы новости → тело запроса API (News на сервере).
 */
export const mapNewsFormToApi = (form) => {
  if (!form || typeof form !== 'object') {
    return form;
  }

  const textSource = form.content ?? form.text ?? '';
  const text =
    typeof textSource === 'string' ? textSource.trim() : textSource;

  return {
    title: form.title?.trim?.() ?? form.title,
    text,
    author: form.author?.trim?.() ?? form.author,
    category: form.category?.trim?.() ?? form.category,
    source: form.source?.trim?.() ?? form.source ?? null,
    type: form.type ?? 'text',
    media: form.mediaUrl ?? form.media ?? null,
    date: form.date,
    viewsCount: form.viewsCount ?? 0,
  };
};
