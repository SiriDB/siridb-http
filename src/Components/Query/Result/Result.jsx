import React from 'react';
import { render } from 'react-dom';
import Table from './Table.jsx';


class Result extends React.Component {

    static propTypes = {
        result: React.PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
    }

    render() {
        let data = this.props.result;

        /**** List Statements ****/
        if (data.columns !== undefined && typeof data.columns[0] === 'string') {
            if (data.series !== undefined) {
                return <Table columns={data.columns} data={data.series} />
            }
            return (
                <div className="query-result">
                    {JSON.stringify(this.props.result)}
                </div>
            )
        }
        return null;
    }
}

export default Result;