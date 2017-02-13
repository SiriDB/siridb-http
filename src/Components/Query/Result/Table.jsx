import React from 'react';
import { render } from 'react-dom';


class Table extends React.Component {

    static propTypes = {
        columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        data: React.PropTypes.arrayOf(React.PropTypes.array).isRequired,
        caption: React.PropTypes.string,
        formatters: React.PropTypes.object
    };

    static defaultProps = {
        caption: null
        // formatters: {},
    };

    constructor(props) {
        super(props);
    }

    render() {
        let formatters = this.props.columns.map((column) => {
            return this.props.formatters[column] || ((val) => val);
        });

        console.log(formatters);
        console.log(this.props.formatters);

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