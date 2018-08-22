import React from 'react';
import PropTypes from 'prop-types';

class AutoCompleteItem extends React.Component {
    static propTypes = {
        isSelected: PropTypes.bool.isRequired,
        itemIdx: PropTypes.number.isRequired,
        keyword: PropTypes.string.isRequired,
        onSelect: PropTypes.func.isRequired,
        wpos: PropTypes.number.isRequired,
    }

    handleClick = () => {
        const {onSelect, itemIdx} = this.props;
        onSelect(itemIdx);
    }

    render() {
        const {isSelected, keyword, wpos} = this.props;
        return (
            <li
                className={isSelected ? 'selected' : ''}
                onClick={this.handleClick}
            >
                <span className="grey">
                    {keyword.substring(0, wpos)}
                </span>
                <span>
                    {keyword.substring(wpos)}
                </span>
            </li>
        );
    }
}

export default AutoCompleteItem;