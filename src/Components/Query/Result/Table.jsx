import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';


class Table extends React.Component {

    static propTypes = {
        columns: PropTypes.arrayOf(PropTypes.string).isRequired,
        data: PropTypes.arrayOf(PropTypes.array).isRequired,
        caption: PropTypes.string,
        formatters: PropTypes.object
    };

    static defaultProps = {
        caption: null,
        formatters: {}
    };

    constructor(props) {
        super(props);
    }

    render() {
        let formatters = this.props.columns.map((column) => {
            return this.props.formatters[column] || ((val) => val);
        });

        return (
            <table className="table table-striped table-condensed table-result">
                <thead>
                    <tr>
                        {this.props.columns.map((column, n) => <th key={n}>{column}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {
                        this.props.data.map((row, r) =>
                            <tr key={r}>
                                {row.map((val, n) => <td key={n}>{formatters[n](val)}</td>)}
                            </tr>
                        )
                    }
                </tbody>
            </table>
        )
    }
}

export default Table;