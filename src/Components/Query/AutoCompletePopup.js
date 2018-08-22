import React from 'react';
import PropTypes from 'prop-types';
import AutoCompleteItem from './AutoCompeteItem';


const AutoCompletePopup = ({keywords, onSelect, selected, show, wpos, xpos}) => (show) ? (
    <ul
        className="autocomplete-popup"
        style={{left: 14 + xpos * 7.24}}
    >
        {
            keywords.map((keyword, n) => (
                <AutoCompleteItem
                    isSelected={(n === selected)}
                    itemIdx={n}
                    key={n}
                    keyword={keyword}
                    onSelect={onSelect}
                    wpos={wpos}
                />
            ))
        }
    </ul>
) : null;

AutoCompletePopup.propTypes = {
    keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired,
    selected: PropTypes.number.isRequired,
    show: PropTypes.bool.isRequired,
    wpos: PropTypes.number.isRequired,
    xpos: PropTypes.number.isRequired,
};

export default AutoCompletePopup;