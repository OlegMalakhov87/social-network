import { useEffect, useState } from 'react';

import { Loading } from '../../../ui';

import styles from './ContentRefetchOverlay.module.css';

const SHOW_DELAY = 300;

/**
 * Показывает наложение при обновлении содержимого.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.message='Обновляем...'] - Текст наложения
 * @returns {JSX.Element|null} Наложение или пустой результат до задержки.
 */
export const ContentRefetchOverlay = ({ message = 'Обновляем...' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <Loading size="small" message={message} />
    </div>
  );
};
