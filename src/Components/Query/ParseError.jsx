import React from 'react';
import { render } from 'react-dom';

class ParseError extends React.Component {

    static propTypes = {
        parseRes: React.PropTypes.shape({
            isValid: React.PropTypes.bool,
            expecting: React.PropTypes.array,
            pos: React.PropTypes.number
        }).isRequired,
    };

    constructor(props) {
        super(props);
    }

    render() {
        let style = {
            left: this.props.parseRes.pos * 7.24
        }
        return (
            <div className="parse-error" style={style}>
                Error at position {this.props.parseRes.pos}
            </div>
        )
    }
}

export default ParseError;