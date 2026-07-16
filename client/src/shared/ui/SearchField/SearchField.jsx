import { Input } from '..';

/**
 * Поле поиска.
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const SearchField = (props) => {
  return (
    <Input
      {...props}
      type="search"
      leftIcon="🔍"
      placeholder={props.placeholder ?? 'Поиск...'}
    />
  );
};
