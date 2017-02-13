import React from 'react';
import { render } from 'react-dom';


class Table extends React.Component {

    static propTypes = {
        columns: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        data: React.PropTypes.arrayOf(React.PropTypes.array).isRequired,
        caption: React.PropTypes.string,
        formatters: React.PropTypes.object
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <table className="table table-striped table-condensed table-result">
                <thead>
                    <tr>
                        {this.props.columns.map((column, n) => <th key={n}>{column}</th>)}
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        )
    }
}

export default Table;