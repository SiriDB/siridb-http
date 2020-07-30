/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
import * as moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {withVlow} from 'vlow';

import DatabaseStore from '../../../Stores/DatabaseStore';
import QueryGroupLnk from './QueryGroupLnk';
import QuerySeriesLnk from './QuerySeriesLnk';
import QueryTagLnk from './QueryTagLnk';
import Series from './Series';
import Table from './Table';


const withStores = withVlow({
    keys: ['factor', 'utcFormat'],
    store: DatabaseStore,
});


class Result extends React.Component {

    static propTypes = {
        result: PropTypes.objectOf(PropTypes.any).isRequired,
        setQuery: PropTypes.func.isRequired,

        /* DatabaseStore properties */
        factor: PropTypes.number.isRequired,
        utcFormat: PropTypes.func.isRequired,
    };

    shouldComponentUpdate(nextProps) {
        const {result} = this.props;
        return (result !== nextProps.result);
    }

    _getResult(data) {
        const {factor, utcFormat, setQuery} = this.props;

        /**** List Statement ****/
        if (data.columns !== undefined && typeof data.columns[0] === 'string') {
            return (data.series !== undefined) ?
                <Table
                    columns={data.columns}
                    data={data.series}
                    formatters={this.getFmtSeries(setQuery, utcFormat, factor)}
                />
                : (data.servers !== undefined) ?
                    <Table
                        columns={data.columns}
                        data={data.servers}
                        formatters={this._fmtServer}
                    />
                    : (data.groups !== undefined) ?
                        <Table
                            columns={data.columns}
                            data={data.groups}
                            formatters={this.getFmtGroup(setQuery)}
                        />
                        : (data.tags !== undefined) ?
                            <Table
                                columns={data.columns}
                                data={data.tags}
                                formatters={this.getFmtTag(setQuery)}
                            />
                            : (data.shards !== undefined) ?
                                <Table
                                    columns={data.columns}
                                    data={data.shards}
                                    formatters={this.getFmtShard(utcFormat, factor)}
                                />
                                : (data.pools !== undefined) ?
                                    <Table
                                        columns={data.columns}
                                        data={data.pools}
                                    />
                                    : (data.users !== undefined) ?
                                        <Table
                                            columns={data.columns}
                                            data={data.users}
                                        /> : null;
        }

        /**** Count Statement ****/
        let countStatement = [
            'series', 'servers', 'groups', 'shards', 'pools', 'tags', 'users',
            'servers_received_points', 'servers_selected_points', 'series_length', 'shards_size'
        ].find((name) => (data[name] !== undefined && typeof data[name] === 'number'));

        if (countStatement !== undefined) {
            return (
                <div className="alert alert-info">
                    {(this._fmtCount[countStatement] || ((val) => val))(data[countStatement])}
                </div>
            );
        }

        /**** Show Statement ****/
        if (data.data !== undefined &&
            data.data instanceof Array &&
            data.data.length &&
            data.data[0].name !== undefined) {
            return (
                <Table
                    columns={['name', 'value']}
                    data={data.data.map((row) => [
                        row.name,
                        (this._fmtServer[row.name] || ((val) => val))(row.value)
                    ])}
                    hideHeader
                />
            );
        }

        /**** Calc Statement ****/
        if (data.calc !== undefined && typeof data.calc === 'number') {
            let seconds = Math.floor(data.calc * factor / 1000);
            let tooltip = (
                <Tooltip id="calc">
                    {(seconds < 315532800)
                        ? moment.duration(seconds, 'seconds').humanize()
                        : utcFormat(new Date(Math.floor(seconds * factor)))}
                </Tooltip>
            );
            return (
                <div className="alert alert-info">
                    <OverlayTrigger
                        overlay={tooltip}
                        placement="top"
                    >
                        <span>
                            {data.calc}
                        </span>
                    </OverlayTrigger>
                </div>
            );
        }

        /**** Success Message ****/
        if (data.success_msg !== undefined && typeof data.success_msg === 'string') {
            return (
                <div className="alert alert-success">
                    {data.success_msg}
                </div>
            );
        }

        /**** Help Statement ****/
        if (data.help !== undefined && typeof data.help === 'string') {
            return (
                <pre>
                    {data.help}
                </pre>
            );
        }

        /**** Message Of The Day (debug) ****/
        if (data.motd !== undefined && typeof data.motd === 'string') {
            return (
                <div>
                    {this._lineBreak(data.motd)}
                </div>
            );
        }

        /**** Select Statement ****/
        let npoints = 0;
        let nseries = 0;
        let charts = (
            <div>
                {
                    Object.entries(data).map(([name, points]) => {
                        npoints += points.length;
                        nseries++;
                        return (
                            <Series
                                factor={factor}
                                key={name}
                                name={name}
                                points={points}
                                utcFormat={utcFormat}
                            />
                        );
                    })
                }
            </div>
        );
        console.log(`Rendered ${nseries} series with a total of ${npoints} points`);
        return charts;
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

    getFmtSeries = (setQuery, utcFormat, factor) => ({
        name: (val) => (
            <QuerySeriesLnk
                seriesName={val}
                setQuery={setQuery}
            />
        ),
        start: (val) => utcFormat(new Date(Math.floor(val * factor))),
        end: (val) => utcFormat(new Date(Math.floor(val * factor)))
    })

    _fmtServer = {
        list_limit: this._fmtLongNumber,
        select_points_limit: this._fmtLongNumber,
        received_points: this._fmtLongNumber,
        selected_points: this._fmtLongNumber,
        buffer_size: this._fmtSize,
        idle_time: (val) => moment.duration(val, 'seconds').humanize(),
        idle_percentage: (val) => `${val}%`,
        mem_usage: (val) => this._fmtSize(val * 1024 * 1024),
        drop_threshold: (val) => `${val} (${Math.floor(val * 100).toString()}%)`,
        startup_time: (val) => `${val} second${(val === 1) ? '' : 's'}`,
        uptime: (val) => moment.duration(val, 'seconds').humanize(),
        online: (val) => (val) ? 'yes' : 'no',
        expiration_log: (val) => (val) ? moment.duration(val, 'seconds').humanize() : 'never',
        expiration_num: (val) => (val) ? moment.duration(val, 'seconds').humanize() : 'never',
    }

    getFmtGroup = (setQuery) => ({
        name: (val) => (
            <QueryGroupLnk
                groupName={val}
                setQuery={setQuery}
            />
        )
    })

    getFmtTag = (setQuery) => ({
        name: (val) => (
            <QueryTagLnk
                setQuery={setQuery}
                tagName={val}
            />
        )
    })

    getFmtShard = (utcFormat, factor) => ({
        size: this._fmtSize,
        start: (val) => utcFormat(new Date(Math.floor(val * factor))),
        end: (val) => utcFormat(new Date(Math.floor(val * factor)))
    })

    _fmtCount = {
        servers_received_points: this._fmtLongNumber,
        servers_selected_points: this._fmtLongNumber,
        series: this._fmtLongNumber,
        series_length: this._fmtLongNumber,
        shards_size: this._fmtSize,
    }

    _lineBreak(content) {
        let regex = /(\n)/g;
        return content.split(regex).map(
            (line, index) => line.match(regex) ? <br key={'key_' + index} /> : line
        );
    }

    render() {
        const {result} = this.props;

        let timeit = (result.__timeit__ !== undefined &&
            result.__timeit__.length &&
            typeof result.__timeit__[0].server === 'string') ? (
                <div className="alert alert-info alert-timeit">
                    <span>
                        {`Query time: ${result.__timeit__[result.__timeit__.length - 1].time.toFixed(3)} seconds`}
                    </span>
                    <dl className="dl-horizontal">
                        {
                            result.__timeit__.reduce((acc, timeit) => acc.concat([
                                <dt key={`dt-${timeit.server}`}>
                                    {timeit.time.toFixed(3)}
                                </dt>,
                                <dd key={`dd-${timeit.server}`}>
                                    {timeit.server}
                                </dd>
                            ]), [])
                        }
                    </dl>
                </div>
            ) : null;

        /* Remove timeit */
        delete result.__timeit__;

        return (
            <div>
                {timeit}
                {this._getResult(result)}
            </div>
        );
    }
}

export default withStores(Result);