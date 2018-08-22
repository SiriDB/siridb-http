import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const X_AXIS = 0;
const Y_AXIS = 1;

class Chart extends React.Component {

    static propTypes = {
        height: PropTypes.number,
        marginBottom: PropTypes.number,
        marginLeft: PropTypes.number,
        marginRight: PropTypes.number,
        marginTop: PropTypes.number,
        points: PropTypes.arrayOf(PropTypes.array).isRequired,
        width: PropTypes.number,
    };

    static defaultProps = {
        height: null,
        marginBottom: 20,
        marginLeft: 52,
        marginRight: 0,
        marginTop: 14,
        width: null,
    }

    componentDidMount() {
        this._init();
    }

    componentDidUpdate() {
        this._init();
    }

    _fmtNumber = (n) => {
        if (n === 0) {
            return '0';
        }

        let e3, t, sign, lookup = 'yzafpnμm KMGTPEZYXWVU';

        if (n < 0) {
            n = -n;
            sign = '-';
        } else {
            sign = '';
        }

        t = (n >= 100 && n < 1000) ? 1 : 10;
        e3 = Math.min(12, Math.max(-8, Math.floor(Math.log(n*t) / Math.log(1000))));
        n /= Math.pow(1000, e3);
        t = (n>=10) ? 10 : 100;
        return sign + (Math.round(n * t) / t) + (e3===0 ? '' : lookup.charAt(e3+8));
    };

    _init() {
        const {width, height, points} = this.props;
        this.width = width || this.chart.offsetWidth || 600;
        this.height = height || this.chart.offsetHeight || 150;
        this._initChart();
        this._initBrush();
        if (points.length) {
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
        const {marginLeft, marginRight} = this.props;

        this.svg.select('.xbrush')
            .call(this.brush);

        this.svg.select('.xaxis')
            .call(this.xAxisFun.ticks((this.width - marginLeft - marginRight) / 100));

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
        const {marginTop, marginBottom, marginLeft, marginRight} = this.props;

        let zoomed = false;

        let brushFun = () => {
            this.svg.selectAll('.tt').attr('display', 'none');
            this.svg.selectAll('.ttdot').attr('display', 'none');
            this.svg.selectAll('.ttline').attr('display', 'none');
        };

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
        };

        let zoomOut = () => {
            const {points} = this.props;
            d3.event.preventDefault();
            if (!zoomed) {
                return;
            }
            zoomed = false;
            this.xS.domain(this._getDomain(points, X_AXIS));
            this._draw(false);
        };

        this.brush = d3.brushX()
            .extent([[0, 0], [
                Math.max(0, this.width - marginLeft - marginRight),
                Math.max(0, this.height - marginTop - marginBottom)
            ]])
            .on('brush', brushFun)
            .on('end', zoomIn);

        let tmp = this.g.append('g')
            .attr('class', 'xbrush')
            .attr('transform', `translate(${marginLeft} ${marginTop})`)
            .on('mousedown', () => { if (d3.event.button === 2) { d3.event.stopImmediatePropagation(); } })
            .call(this.brush);

        tmp.selectAll('rect')
            .attr('height', this.height - marginTop - marginBottom)
            .on('contextmenu', zoomOut);
    }

    _initChart() {
        const {marginTop, marginBottom, marginLeft, marginRight, points} = this.props;

        this.xS = d3.scaleTime()
            .domain(this._getDomain(points, X_AXIS))
            .range([marginLeft, this.width - marginRight]);

        this.yS = d3.scaleLinear()
            .domain(this._getDomain(points, Y_AXIS))
            .range([this.height - marginBottom, marginTop]);

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
            .ticks((this.height - marginTop - marginBottom) / 30)
            .tickFormat((d) => this._fmtNumber(d));

        this.lineFun = d3.line()
            .x((d) => this.xS(d[0]))
            .y((d) => this.yS(d[1]));

        this.svg = d3.select(this.chart).append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .datum(points);

        this.svg.append('g')
            .attr('class', 'axis xaxis')
            .attr('transform', `translate(0 ${this.height - marginBottom})`);
        this.svg.append('g')
            .attr('class', 'axis yaxis')
            .attr('transform', `translate(${marginLeft} 0)`);

        this.g = this.svg.append('g')
            .attr('class', 'series')
            .attr('clip-path', 'url(#clip)');

        this.g.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', marginLeft)
            .attr('width', this.width - marginLeft - marginRight)
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
        const {marginTop, marginBottom, marginLeft, points} = this.props;

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
            pos[0] += marginLeft;
            var inv = this.xS.invert(pos[0]);
            var idx = points
                .map((d) => Math.abs(d[0] - inv))
                .reduce((minIdx, d, i, alist) => d < alist[minIdx] ? i : minIdx, 0);

            var x = Math.floor(pos[0] - 170 > 0 ? pos[0] - 170 : pos[0] + 10);
            var y = pos[1] - 50 > 0 ? pos[1] - 30 : pos[1] + 30;

            var pt = points[idx];

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
                    [this.xS(pt[0]), marginTop],
                    [this.xS(pt[0]), this.height - marginBottom]
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

    mapRef = (el) => {
        this.chart = el;
    }

    render() {
        return (
            <div
                className="chart"
                ref={this.mapRef}
            />
        );
    }
}

export default Chart;