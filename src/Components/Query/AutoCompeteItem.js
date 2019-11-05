import React from 'react';
import PropTypes from 'prop-types';

const AutoCompleteItem = ({isSelected, itemIdx, keyword, onSelect, wpos}) => {
    function handleClick () {
        onSelect(itemIdx);
    }

    return (
        <li
            className={isSelected ? 'selected' : ''}
            onClick={handleClick}
        >
            <span className="grey">
                {keyword.substring(0, wpos)}
            </span>
            <span>
                {keyword.substring(wpos)}
            </span>
        </li>
    );
};

AutoCompleteItem.propTypes = {
    isSelected: PropTypes.bool.isRequired,
    itemIdx: PropTypes.number.isRequired,
    keyword: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    wpos: PropTypes.number.isRequired,
};

export default AutoCompleteItem;