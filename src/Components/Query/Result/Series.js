import React from 'react';
import PropTypes from 'prop-types';
import Table from './Table';
import Chart from '../../../Utils/Chart';


class Series extends React.Component {

    static propTypes = {
        factor: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        points: PropTypes.arrayOf(PropTypes.array).isRequired,
        utcFormat: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        const {points} = this.props;
        this.vtype = points.length ? typeof points[0][1] : 'empty';
        this.state = {
            asChart: this.vtype !== 'string' && points.length > 1
        };
    }

    shouldComponentUpdate() {
        return true;
    }

    fmtSelect = {
        time: (val) => {
            const {utcFormat, factor} = this.props;
            return utcFormat(new Date(Math.floor(val * factor)));
        }
    }

    handleToggle = () => {
        this.setState((prevState) => ({asChart: !prevState.asChart}));
    }

    render() {
        const {factor, name, points} = this.props;
        const {asChart} = this.state;
        const toggle = this.vtype === 'number' ? (
            <i
                className={`fa fa-${asChart ? 'bars' : 'line-chart'}`}
                onClick={this.handleToggle}
                style={{float: 'right', cursor: 'pointer'}}
            />
        ) : null;

        return (
            <div style={{opacity: this.vtype === 'empty' ? 0.5 : 1.0}}>
                <div style={{
                    width: '100%',
                    padding: 5,
                    backgroundColor: '#516771',
                    display: 'block',
                    borderBottom: '3px solid #627c87'}}
                >
                    <span style={{wordBreak: 'break-all'}}>
                        {name}
                    </span>
                    {toggle}
                </div>
                {asChart ? (
                    <Chart
                        key={name}
                        name={name}
                        points={points.map((point) => [point[0] * factor, point[1]])}
                    />
                ) : (
                    <Table
                        columns={['time', 'value']}
                        data={points}
                        formatters={this.fmtSelect}
                        hideHeader
                    />
                )}
            </div>
        );
    }


}

export default Series;