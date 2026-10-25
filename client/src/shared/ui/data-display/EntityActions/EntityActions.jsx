import { ActionsBar } from '../../../ui';

import style from './EntityActions.module.css';

/**
 * Отображает действия над сущностью.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object[]} [props.actions=[]] - Действия с ключом, подписью и обработчиком
 * @returns {JSX.Element|null} Действия или пустой результат без них.
 */

export const EntityActions = ({ actions = [] }) => {
  if (!actions.length) return null;

  return (
    <footer className={style.footer}>
      <ActionsBar actions={actions} />
    </footer>
  );
};
