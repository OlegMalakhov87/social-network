import { Text } from '../../../ui';
import { classNames } from '../../../utils';

import styles from './RichText.module.css';

/**
 * Отображает текст с абзацами и переносами строк.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.text - Исходный текст
 * @param {'h1'|'h2'|'h3'|'h4'|'body1'|'body2'|'caption'|'inherit'} [props.variant='body1'] - Вариант оформления
 * @param {boolean} [props.linkify=false] - Преобразование адресов URL в ссылки
 * @param {string} [props.className=''] - CSS-класс контейнера
 * @param {string} [props.paragraphClassName=''] - CSS-класс абзацев
 * @param {string} [props.emptyText=''] - Текст, если исходный текст пуст
 * @param {React.Ref} [props.ref] - Ссылка на контейнер
 * @returns {JSX.Element|null} Текст или пустой результат.
 */
export const RichText = ({
  text,
  variant = 'body1',
  linkify = false,
  className = '',
  paragraphClassName = '',
  emptyText = '',
  ref,
}) => {
  const normalizedText = String(text ?? '')
    .replace(/\r\n/g, '\n')
    .trim();

  if (!normalizedText) {
    if (!emptyText) return null;

    return (
      <Text
        variant={variant}
        className={classNames(styles.paragraph, paragraphClassName)}
      >
        {emptyText}
      </Text>
    );
  }

  const paragraphs = normalizedText
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className={classNames(styles.root, className)} ref={ref}>
      {paragraphs.map((paragraph, index) => (
        <Text
          key={`${index}-${paragraph.slice(0, 24)}`}
          variant={variant}
          linkify={linkify}
          className={classNames(styles.paragraph, paragraphClassName)}
        >
          {paragraph}
        </Text>
      ))}
    </div>
  );
};
