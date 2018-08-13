import React from 'react';
import PropTypes from 'prop-types';


class AutoCompletePopup extends React.Component {

    static propTypes = {
        keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
        xpos: PropTypes.number.isRequired,
        wpos: PropTypes.number.isRequired,
        selected: PropTypes.number.isRequired,
        show: PropTypes.bool.isRequired,
        onSelect: PropTypes.func.isRequired
    };

    render() {
        let style = {
            left: 14 + this.props.xpos * 7.24
        };
        return (this.props.show) ? (
            <ul className="autocomplete-popup" style={style}>
                {
                    this.props.keywords.map((keyword, n) =>
                        <li key={n}
                            className={(n === this.props.selected) ? 'selected' : ''}
                            onClick={() => this.props.onSelect(n)}>
                            <span className="grey">{keyword.substring(0, this.props.wpos)}</span>
                            <span>{keyword.substring(this.props.wpos)}</span>
                        </li>
                    )
                }
            </ul>
        ) : null;
    }
}

export default AutoCompletePopup;
