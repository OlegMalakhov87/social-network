/**
 * Функция для отображения полей с данными пользователя на странице профиля.
 *
 * @param {Object} props
 * @param {Object|null} props.user
 */

export const getProfileFields = (user) =>
  [
    { label: 'Никнейм:', value: user?.nickname },
    { label: 'Имя:', value: user?.name },
    { label: 'Возраст:', value: user?.age },
    { label: 'Email:', value: user?.email },
    { label: 'Город:', value: user?.address },
    { label: 'Работа:', value: user?.job },
    { label: 'Статус:', value: user?.status },
    { label: 'Телефон:', value: user?.phone },
  ].filter((field) => field.value !== undefined && field.value !== null);
