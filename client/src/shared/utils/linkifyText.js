import styles from '../ui/primitives/Text/Text.module.css';

/**
 * Превращает адреса URL в тексте в ссылки.
 *
 * @param {string} [text=''] - Исходный текст
 * @returns {Array|string} Части текста и ссылки или исходное значение, если текст пуст.
 */
export const linkifyText = (text = '') => {
  if (!text) return text;

  // Делит текст по URL и оставляет совпадения в массиве.
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  // Проверяет каждую часть отдельным выражением: глобальное выражение сохраняет последнюю позицию.
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
