import PropTypes from 'prop-types';
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
      placeholder={props.placeholder ?? 'Поиск...'}
    />
  );
};

SearchField.propTypes = {
  placeholder: PropTypes.string,
};

SearchField.defaultProps = {
  placeholder: 'Поиск...',
};
