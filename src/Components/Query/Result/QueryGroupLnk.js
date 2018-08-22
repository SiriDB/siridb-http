import React from 'react';
import PropTypes from 'prop-types';

class QueryGroupLnk extends React.PureComponent {

    static propTypes = {
        groupName: PropTypes.string.isRequired,
        setQuery: PropTypes.func.isRequired,
    };

    handleClick = () => {
        const {groupName, setQuery,} = this.props;
        setQuery(`list series \`${groupName}\``);
    }

    render() {
        const {groupName} = this.props;
        return (
            <span>
                <a onClick={this.handleClick}>
                    <i className="fa fa-fw fa-copy" />
                </a>
                {groupName}
            </span>
        );
    }
}

export default QueryGroupLnk;