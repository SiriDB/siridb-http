import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import * as d3 from 'd3';

const X_AXIS = 0;
const Y_AXIS = 1;

class Chart extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        points: PropTypes.arrayOf(PropTypes.array).isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        marginTop: PropTypes.number,
        marginRight: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
    };

    static defaultProps = {
        marginTop: 14,
        marginRight: 0,
        marginBottom: 20,
        marginLeft: 80,
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._init();
    }

    componentDidUpdate() {
        this._init();
    }

    _init() {
        this.width = this.props.with || this.refs.chart.offsetWidth || 600;
        this.height = this.props.height || this.refs.chart.offsetHeight || 150;
        this._initChart();
        this._initBrush();
        if (this.props.points.length) {
            this._Tooltip();
        } else {
            this.g.append('text')
                .attr('class', 'seriesmsg')
                .attr('x', Math.floor(this.width / 2))
                .attr('y', Math.floor(this.height / 2))
                .text('no points found');
        }
        this._draw(true);
    }

    _getDomain(d, axis) {
        let span = d3.extent(d.map((d) => d[axis]));
        if (span[0] === span[1]) {
            span[0]--;
            span[1]++;
        }

        return span;
    }

    _draw(init) {

        this.svg.select('.xbrush')
            .call(this.brush);

        this.svg.select('.xaxis')
            .call(this.xAxisFun.ticks((this.width - this.props.marginLeft - this.props.marginRight) / 100));

        this.svg.select('.yaxis')
            .call(this.yAxisFun);

        this.line.attr('d', this.lineFun);

        let dotsCircle = this.dots.selectAll('circle').data((d) => d);

        if (init) {
            dotsCircle
                .enter()
                .append('circle')
                .attr('r', 1.5)
                .attr('cx', (d) => this.xS(d[0]))
                .attr('cy', (d) => this.yS(d[1]));
        } else {
            dotsCircle
                .attr('cx', (d) => this.xS(d[0]))
                .attr('cy', (d) => this.yS(d[1]));
        }
    }

    _initBrush() {
        let zoomed = false;

        let brushFun = () => {
            this.svg.selectAll('.tt').attr('display', 'none');
            this.svg.selectAll('.ttdot').attr('display', 'none');
            this.svg.selectAll('.ttline').attr('display', 'none');
        }

        let zoomIn = () => {

            if (!d3.event.selection) {
                return;
            }

            let span = d3.event.selection.map((v, i, a) => this.xS.invert(v + 80, i, a));

            if (this.xS(span[1]) - this.xS(span[0]) < 10) {
                return;
            }
            zoomed = true;
            this.xS.domain(span);
            this.g.select('.xbrush').call(this.brush.move, null);
            this._draw(false);
        }

        let zoomOut = () => {
            d3.event.preventDefault();
            if (!zoomed) {
                return;
            }
            zoomed = false;
            this.xS.domain(this._getDomain(this.props.points, X_AXIS));
            this._draw(false);
        }

        this.brush = d3.brushX()
            .extent([[0, 0], [
                Math.max(0, this.width - this.props.marginLeft - this.props.marginRight),
                Math.max(0, this.height - this.props.marginTop - this.props.marginBottom)
            ]])
            .on('brush', brushFun)
            .on('end', zoomIn);

        let tmp = this.g.append('g')
            .attr('class', 'xbrush')
            .attr('transform', `translate(${this.props.marginLeft} ${this.props.marginTop})`)
            .on('mousedown', () => { if (d3.event.button === 2) { d3.event.stopImmediatePropagation(); } })
            .call(this.brush);

        tmp.selectAll('rect')
            .attr('height', this.height - this.props.marginTop - this.props.marginBottom)
            .on('contextmenu', zoomOut);
    }

    _initChart() {
        this.xS = d3.scaleTime()
            .domain(this._getDomain(this.props.points, X_AXIS))
            .range([this.props.marginLeft, this.width - this.props.marginRight]);

        this.yS = d3.scaleLinear()
            .domain(this._getDomain(this.props.points, Y_AXIS))
            .range([this.height - this.props.marginBottom, this.props.marginTop]);

        this.xAxisFun = d3.axisBottom(this.xS)
            .tickFormat(function (d) {
                return (d3.timeSecond(d) < d ? d3.timeFormat('.%L')
                    : d3.timeMinute(d) < d ? d3.timeFormat(':%S')
                        : d3.timeHour(d) < d ? d3.timeFormat('%H:%M')
                            : d3.timeDay(d) < d ? d3.timeFormat('%H:%M')
                                : d3.timeMonth(d) < d ? (d3.timeWeek(d) < d ? d3.timeFormat('%a %d') : d3.timeFormat('%b %d'))
                                    : d3.timeYear(d) < d ? d3.timeFormat('%B')
                                        : d3.timeFormat('%Y'))(d);
            });

        this.yAxisFun = d3.axisLeft(this.yS)
            .ticks((this.height - this.props.marginTop - this.props.marginBottom) / 30);

        this.lineFun = d3.line()
            .x((d) => this.xS(d[0]))
            .y((d) => this.yS(d[1]));

        this.svg = d3.select(this.refs.chart).append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .datum(this.props.points);

        let seriesHdr = this.svg.append('g')
            .attr('class', 'serieshdr');
        seriesHdr.append('rect')
            .attr('x', this.props.marginLeft)
            .attr('width', 10)
            .attr('height', 10);
        seriesHdr.append('text')
            .attr('x', this.props.marginLeft + 14)
            .attr('y', 10)
            .text(this.props.name);

        this.svg.append('g')
            .attr('class', 'axis xaxis')
            .attr('transform', `translate(0 ${this.height - this.props.marginBottom})`);
        this.svg.append('g')
            .attr('class', 'axis yaxis')
            .attr('transform', `translate(${this.props.marginLeft} 0)`);

        this.g = this.svg.append('g')
            .attr('class', 'series')
            .attr('clip-path', 'url(#clip)');

        this.g.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', this.props.marginLeft)
            .attr('width', this.width - this.props.marginLeft - this.props.marginRight)
            .attr('height', this.height);

        this.g.append('circle')
            .attr('class', 'ttdot')
            .attr('display', 'none')
            .attr('r', 3);

        this.line = this.g.append('path')
            .attr('class', 'line');

        this.dots = this.g.append('g')
            .attr('class', 'dots');

        this.dots.append('path')
            .attr('class', 'ttline')
            .attr('display', 'none');
    }

    _Tooltip() {
        let tFormat = d3.timeFormat('%Y-%m-%d %H:%M:%S');

        let ttOutFun = () => {
            tt.attr('display', 'none');
            this.svg.select('.ttdot').attr('display', 'none');
            this.svg.select('.ttline').attr('display', 'none');
        };

        let ttLine = d3.line()
            .x((d) => d[0])
            .y((d) => d[1]);

        let ttMoveFun = (_, i, nodelist) => {
            var pos = d3.mouse(nodelist[i]);
            pos[0] += this.props.marginLeft;
            var inv = this.xS.invert(pos[0]);
            var idx = this.props.points
                .map((d) => Math.abs(d[0] - inv))
                .reduce((minIdx, d, i, alist) => d < alist[minIdx] ? i : minIdx, 0);

            var x = Math.floor(pos[0] - 170 > 0 ? pos[0] - 170 : pos[0] + 10);
            var y = pos[1] - 50 > 0 ? pos[1] - 30 : pos[1] + 30;

            var pt = this.props.points[idx];

            tt
                .attr('transform', `translate(${x} ${y})`)
                .attr('display', 'inline');
            ttime.text(tFormat((new Date(pt[0]))));
            ttval.text(pt[1]);

            this.svg.select('.ttdot')
                .attr('cx', this.xS(pt[0]))
                .attr('cy', this.yS(pt[1]))
                .attr('display', 'inline');

            this.svg.select('.ttline')
                .attr('d', ttLine([
                    [this.xS(pt[0]), this.props.marginTop],
                    [this.xS(pt[0]), this.height - this.props.marginBottom]
                ]))
                .attr('display', 'inline');
        };

        let tt = this.svg.append('g')
            .attr('class', 'tt')
            .attr('display', 'none');

        tt.append('rect')
            .attr('class', 'ttbg')
            .attr('width', 160)
            .attr('height', 40);

        let ttime = tt.append('text')
            .attr('class', 'ttname')
            .attr('x', 4)
            .attr('y', 14);

        let ttval = tt.append('text')
            .attr('class', 'ttval')
            .attr('x', 4)
            .attr('y', 30);

        this.svg.select('.xbrush')
            .on('mousemove', ttMoveFun)
            .on('mouseout', ttOutFun);
    }

    render() {
        return (
            <div className="chart" ref="chart"></div>
        )
    }
}

export default Chart;