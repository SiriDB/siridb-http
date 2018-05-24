import React from 'react';  // eslint-disable-line
import PropTypes from 'prop-types';
import Table from './Table.jsx';
import Chart from '../../../Utils/Chart.jsx';


class Series extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        points: PropTypes.array.isRequired,
        factor: PropTypes.number.isRequired,
        utcFormat: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.vtype = this.props.points.length ? typeof this.props.points[0][1] : 'empty';
        this.state = {
            asChart: this.vtype !== 'string' && this.props.points.length > 1
        };
    }

    toggle() {
        this.setState({asChart: !this.state.asChart});
    }

    render() {
        let toggle = this.vtype === 'number'
            ? <i style={{float: 'right', cursor: 'pointer'}} className={`fa fa-${this.state.asChart ? 'bars' : 'line-chart'}`} onClick={this.toggle.bind(this)}></i>
            : null;
        return (
            <div style={{opacity: this.vtype === 'empty' ? 0.5 : 1.0}}>
                <div style={{
                    width: '100%',
                    padding: 5,
                    backgroundColor: '#516771',
                    display: 'block',
                    borderBottom: '3px solid #627c87'}}
                >
                    <span style={{wordBreak: 'break-all'}}>{this.props.name}</span>
                    {toggle}
                </div>
                {this.state.asChart
                    ? <Chart
                        key={this.props.name}
                        name={this.props.name}
                        points={this.props.points.map((point) => [point[0] * this.props.factor, point[1]])} />
                    : <Table
                        columns={['time', 'value']}
                        data={this.props.points}
                        formatters={this._fmtSelect}
                        hideHeader={true} />
                }
            </div>
        );
    }

    _fmtSelect = {
        time: (val) => this.props.utcFormat(new Date(Math.floor(val * this.props.factor))),
    }
}

export default Series;