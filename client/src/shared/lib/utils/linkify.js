/**
 * Превращает URL-адреса в тексте в кликабельные стилизованные ссылки.
 * @param {string} text - исходный текст
 * @returns {React.ReactNode[]} массив строк и элементов <a>
 */
export const linkify = (text) => {
  if (!text) return text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  const linkStyle = {
    color: '#667eea',
    textDecoration: 'underline',
    wordBreak: 'break-all',
  };

  return parts.map((part, index) =>
    urlRegex.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={linkStyle}>
        {part}
      </a>
    ) : (
      part
    )
  );
};
