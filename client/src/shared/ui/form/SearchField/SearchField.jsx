import { Input } from '../..';

/**
 * Поле поиска.
 *
 * @param {Object} props
 * @returns {JSX.Element}
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
