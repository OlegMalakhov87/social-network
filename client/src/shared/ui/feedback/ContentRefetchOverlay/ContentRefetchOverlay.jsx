import { useEffect, useState } from 'react';
import { Loading } from '../../../ui';
import styles from './ContentRefetchOverlay.module.css';

const SHOW_DELAY = 300;

/**
 * Компонент для отображения оверлея при перезагрузке контента.
 * @param {Object} props
 * @param {string} props.message - сообщение для отображения
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
