import { Text } from '../../../ui';
import { classNames } from '../../../utils';
import styles from './RichText.module.css';

/**
 * Рендер текста с сохранением абзацев и переносов.
 *
 * @param {Object} props
 * @param {string} props.text - исходный текст
 * @param {'h1'|'h2'|'h3'|'h4'|'body1'|'body2'|'caption'|'inherit'} [props.variant='body1'] - типографический вариант
 * @param {boolean} [props.linkify=false] - преобразовывать URL в ссылки
 * @param {string} [props.className=''] - класс контейнера
 * @param {string} [props.paragraphClassName=''] - класс абзацев
 * @param {string} [props.emptyText=''] - текст-заглушка, если `text` пустой
 */
export const RichText = ({
  text,
  variant = 'body1',
  linkify = false,
  className = '',
  paragraphClassName = '',
  emptyText = '',
}) => {
  const normalizedText = String(text ?? '')
    .replace(/\r\n/g, '\n')
    .trim();

  if (!normalizedText) {
    if (!emptyText) return null;

    return (
      <Text variant={variant} className={classNames(styles.paragraph, paragraphClassName)}>
        {emptyText}
      </Text>
    );
  }

  const paragraphs = normalizedText
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className={classNames(styles.root, className)}>
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
