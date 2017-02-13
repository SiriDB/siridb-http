import React from 'react';
import { render } from 'react-dom';
import Table from './Table.jsx';



class Result extends React.Component {

    static propTypes = {
        result: React.PropTypes.object.isRequired,
        setQuery: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    render() {
        let data = this.props.result;

        /**** List Statements ****/
        if (data.columns !== undefined && typeof data.columns[0] === 'string') {
            if (data.series !== undefined) {
                return <Table columns={data.columns} data={data.series} formatters={this._fmt_series} />
            }
            return (
                <div className="query-result">
                    {JSON.stringify(this.props.result)}
                </div>
            )
        }
        return null;
    }

    _fmt_series = {
        name: (val) => {
            return (
                <span>
                    <a onClick={() => this.props.setQuery(`select * from "${val}" after now - 1h`)}>
                        <i className="fa fa-copy"></i>
                    </a>&nbsp;
                    {val}
                </span>
            );
        }
    }
}

export default Result;