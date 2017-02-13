import React from 'react';
import { render } from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


class AutoCompletePopup extends React.Component {

    static propTypes = {
        keywords: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        xpos: React.PropTypes.number.isRequired,
        wpos: React.PropTypes.number.isRequired,
        selected: React.PropTypes.number.isRequired,
        show: React.PropTypes.bool.isRequired,
        onSelect: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    render() {
        let style = {
            left: 14 + this.props.xpos * 7.24
        }
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
        ) : null
    }
}

export default AutoCompletePopup;