import { Input } from '../..';

/**
 * Отображает поле поиска и передаёт остальные свойства полю ввода.
 *
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.fullWidth=true] - Растягивание на всю ширину
 * @param {string} [props.placeholder='Поиск...'] - Подсказка пустого поля
 * @returns {JSX.Element} Поле поиска.
 */
export const SearchField = (props) => {
  const { fullWidth = true, ...restProps } = props;

  return (
    <Input
      {...restProps}
      type="search"
      leftIcon="🔍"
      fullWidth={fullWidth}
      placeholder={restProps.placeholder ?? 'Поиск...'}
    />
  );
};
