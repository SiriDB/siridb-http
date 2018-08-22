import React from 'react';
import PropTypes from 'prop-types';

class QuerySeriesLnk extends React.PureComponent {

    static propTypes = {
        seriesName: PropTypes.string.isRequired,
        setQuery: PropTypes.func.isRequired,
    };

    handleClick = () => {
        const {seriesName, setQuery,} = this.props;
        setQuery(`select * from "${seriesName}" after now - 1h`);
    }

    render() {
        const {seriesName} = this.props;
        return (
            <span>
                <a onClick={this.handleClick}>
                    <i className="fa fa-fw fa-copy" />
                </a>
                {seriesName}
            </span>
        );
    }
}

export default QuerySeriesLnk;