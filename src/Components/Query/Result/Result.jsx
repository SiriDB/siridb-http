import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import Table from './Table.jsx';
import DatabaseStore from '../../../Stores/DatabaseStore.jsx';
import * as d3 from 'd3';
import * as moment from 'moment';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Chart from '../../../Utils/Chart.jsx';


class Result extends Reflux.Component {

    static propTypes = {
        result: React.PropTypes.object.isRequired,
        setQuery: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.store = DatabaseStore;
    }

    initTime() {
        this.factor = {
            s: 1e3,
            ms: 1e0,
            us: 1e-3,
            ns: 1e-6
        }[this.state.timePrecision];
        this.utcFormat = d3.utcFormat("%Y-%m-%d %H:%M:%SZ");
    }

    render() {
        this.initTime();
        let data = this.props.result;

        /**** List Statement ****/
        if (data.columns !== undefined && typeof data.columns[0] === 'string') {
            return (data.series !== undefined) ?
                <Table columns={data.columns} data={data.series} formatters={this._fmtSeries} />
                : (data.servers !== undefined) ?
                    <Table columns={data.columns} data={data.servers} formatters={this._fmtServer} />
                    : (data.groups !== undefined) ?
                        <Table columns={data.columns} data={data.groups} formatters={this._fmtGroup} />
                        : (data.shards !== undefined) ?
                            <Table columns={data.columns} data={data.shards} formatters={this._fmtShard} />
                            : (data.pools !== undefined) ?
                                <Table columns={data.columns} data={data.pools} />
                                : (data.users !== undefined) ?
                                    <Table columns={data.columns} data={data.users} /> : null;
        }

        /**** Count Statement ****/
        let countStatement = [
            'series', 'servers', 'groups', 'shards', 'pools', 'users',
            'servers_received_points', 'series_length', 'shards_size'
        ].find((name) => (data[name] !== undefined && typeof data[name] === 'number'));

        if (countStatement !== undefined) {
            return <div className={'alert alert-info'}>{
                (this._fmtCount[countStatement] || ((val) => val))(data[countStatement])
            }</div>
        }

        /**** Show Statement ****/
        if (data.data !== undefined &&
            data.data instanceof Array &&
            data.data.length &&
            data.data[0].name !== undefined) {
            return <Table
                columns={['name', 'value']}
                data={data.data.map((row) => [
                    row.name,
                    (this._fmtServer[row.name] || ((val) => val))(row.value)
                ])} />
        }

        /**** Calc Statement ****/
        if (data.calc !== undefined && typeof data.calc === 'number') {
            let seconds = parseInt(data.calc * this.factor / 1000);
            let tooltip = <Tooltip id="calc">{(seconds < 315532800) ?
                moment.duration(seconds, 'seconds').humanize() :
                this.utcFormat(new Date(Math.floor(seconds * this.factor)))
            }</Tooltip>;
            return (
                <div className={'alert alert-info'}>
                    <OverlayTrigger overlay={tooltip} placement="top">
                        <span>{data.calc}</span>
                    </OverlayTrigger>
                </div>
            )
        }

        /**** Success Message ****/
        if (data.success_msg !== undefined && typeof data.success_msg === 'string') {
            return <div className={'alert alert-success'}>{data.success_msg}</div>
        }

        /**** Help Statement ****/
        if (data.help !== undefined && typeof data.help === 'string') {
            return <pre>{data.help}</pre>
        }

        return (
            <div>
                {
                    Object.entries(data).map(([series, points]) =>
                        <Chart key={series} name={series} points={points} options={{}} />
                    )
                }
            </div>
        )

        return null;
    }

    _fmtSize(size) {
        let lookupTable = 'BKMGTPEZYXWVU';
        if (size > 0) {
            let i = Math.min(Math.floor(Math.log(size) / Math.log(1024)), 12);
            let n = Math.round(size * 100 / Math.pow(1024, i)) / 100;
            return (i) ? n + ' ' + lookupTable.charAt(i) + 'B' : n + ' bytes';
        }
        return '0 bytes';
    }

    _fmtLongNumber(n) {
        // code from http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
        n = n.toString();
        if (n >= Math.pow(10, 6)) {
            while (/(\d+)(\d{3})/.test(n)) {
                n = n.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
            }
        }
        return n;
    }

    _fmtSeries = {
        name: (val) => {
            return (
                <span>
                    <a onClick={() => this.props.setQuery(`select * from "${val}" after now - 1h`)}>
                        <i className="fa fa-copy"></i>
                    </a>&nbsp;
                    {val}
                </span>
            );
        },
        start: (val) => this.utcFormat(new Date(Math.floor(val * this.factor))),
        end: (val) => this.utcFormat(new Date(Math.floor(val * this.factor)))
    }

    _fmtServer = {
        received_points: this._fmtLongNumber,
        buffer_size: this._fmtSize,
        mem_usage: (val) => this._fmtSize(val * 1024 * 1024),
        drop_threshold: (val) => `${val} (${parseInt(val * 100).toString()}%)`,
        startup_time: (val) => `${val} second${(val === 1) ? '' : 's'}`,
        uptime: (val) => moment.duration(val, 'seconds').humanize(),
        online: (val) => (val) ? 'yes' : 'no'
    }

    _fmtGroup = {
        name: (val) => {
            return (
                <span>
                    <a onClick={() => this.props.setQuery(`list series \`${val}\``)}>
                        <i className="fa fa-copy"></i>
                    </a>&nbsp;
                    {val}
                </span>
            );
        }
    }

    _fmtShard = {
        size: (val) => this._fmtSize,
        start: (val) => this.utcFormat(new Date(Math.floor(val * this.factor))),
        end: (val) => this.utcFormat(new Date(Math.floor(val * this.factor)))
    }

    _fmtCount = {
        servers_received_points: this._fmtLongNumber,
        series: this._fmtLongNumber,
        series_length: this._fmtLongNumber,
        shards_size: this._fmtSize,
    }
}

export default Result;