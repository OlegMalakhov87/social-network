import styles from '../ui/Text/Text.module.css';

/**
 * Функция для превращения URL-адресов в тексте в кликабельные стилизованные ссылки.
 *
 * @param {string} text - исходный текст
 * @returns {React.ReactNode[]} массив строк и элементов <a>
 */
export const linkify = (text = '') => {
  if (!text) return text;

  // Разделяем текст по URL — капчуры-группа включает совпадения в массив
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  // Используем отдельный regex без флага g для проверки каждой части,
  // чтобы избежать бага с сохранением lastIndex у глобального RegExp
  const urlPattern = /^https?:\/\/[^\s]+$/;

  return parts.map((part, index) =>
    urlPattern.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};
