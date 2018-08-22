import React from 'react';
import PropTypes from 'prop-types';

const ParseError = ({parseRes: {pos}}) => (
    <div
        className="parse-error"
        style={{left: pos * 7.24}}
    >
        {`Error at position ${pos}`}
    </div>
);

ParseError.propTypes = {
    parseRes: PropTypes.shape({
        isValid: PropTypes.bool,
        expecting: PropTypes.array,
        pos: PropTypes.number
    }).isRequired,
};


export default ParseError;