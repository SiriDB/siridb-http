import React from 'react';
import PropTypes from 'prop-types';

class QueryTagLnk extends React.PureComponent {

    static propTypes = {
        tagName: PropTypes.string.isRequired,
        setQuery: PropTypes.func.isRequired,
    };

    handleClick = () => {
        const {tagName, setQuery,} = this.props;
        setQuery(`list series \`${tagName}\``);
    }

    render() {
        const {tagName} = this.props;
        return (
            <span>
                <a onClick={this.handleClick}>
                    <i className="fa fa-fw fa-copy" />
                </a>
                {tagName}
            </span>
        );
    }
}

export default QueryTagLnk;