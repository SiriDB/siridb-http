import React from 'react';
import { render } from 'react-dom';
import * as d3 from 'd3';

const X_AXIS = 0;
const Y_AXIS = 1;

class Chart extends React.Component {

    static propTypes = {
        name: React.PropTypes.string.isRequired,
        points: React.PropTypes.arrayOf(React.PropTypes.array).isRequired,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        marginTop: React.PropTypes.number,
        marginRight: React.PropTypes.number,
        marginBottom: React.PropTypes.number,
        marginLeft: React.PropTypes.number,
    };

    static defaultProps = {
        color: '#a1b2bc',
        textColor: '#fff',
        axisColor: '#999',
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

        let self = this;

        this.svg.select('.xaxis')
            .each(function () { self._xTicks(d3.select(this)); });

        this.svg.select('.yaxis')
            .each(function () { self._yTicks(d3.select(this)); });

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

    _xTicksFun(val, g, t0, t1, dFormat, hFormat) {
        for (let i = t0 - t0 % val - 7200; i < t1 + 1; i += val) {
            let d = this.xS(i * 1000);
            if (d >= this.xS.range()[0]) {
                g.append('text')
                    .attr('x', d)
                    .attr('y', 16)
                    .attr('text-anchor', 'middle')
                    .attr('fill', this.props.textColor)
                    .text(i % 86400 === 86400 - 7200 ? dFormat(new Date(i * 1000)) : hFormat(new Date(i * 1000)));
            }
        }
    }

    _xTicks(g) {
        let lineX = d3.line()
            .x((d) => d[0])
            .y((d) => d[1]);

        g.html('')
            .append('g')
            .append('path')
            .attr('d', lineX([
                [this.props.marginLeft, 0],
                [this.width - this.props.marginRight, 0]
            ]))
            .attr('stroke', this.props.axisColor);

        let tickSize = 60;
        let t0 = this.xS.domain()[0] / 1000;
        let t1 = this.xS.domain()[1] / 1000;
        let dFormat = d3.timeFormat('%a %d %b');
        let hFormat = d3.timeFormat('%H:%M');
        let diff = (this.xS.invert(tickSize) - this.xS.invert(0)) / 1000;

        [300, 600, 900, 1800, 3600, 7200, 10800, 14400, 28800, 43200, 86400, 86400 * 2, 86400 * 7].some((d) => {
            if (diff < d) {
                this._xTicksFun(d, g, t0, t1, dFormat, hFormat);
            }
        });
    }

    _yTicksFun(val, g, t0, t1) {
        for (let i = t0 - t0 % val; i < t1 + 1; i += val) {
            let d = this.yS(i);
            if (d <= this.yS.range()[0] && d >= this.yS.range()[1]) {
                g.append('text')
                    .attr('x', -10)
                    .attr('y', d)
                    .attr('text-anchor', 'end')
                    .attr('fill', this.props.textColor)
                    .text((i % 1) ? i.toFixed(5) : i);
            }
            this.nTicksReal++;
        }
    }

    _yTicks(g) {
        let lineY = d3.line()
            .x((d) => d[0])
            .y((d) => d[1]);

        g.html('')
            .append('g')
            .append('path')
            .attr('d', lineY([
                [0, this.props.marginTop],
                [0, this.height - this.props.marginBottom]
            ]))
            .attr('stroke', this.props.axisColor);
        let tickSize = 20;

        let t0 = this.yS.domain()[0];
        let t1 = this.yS.domain()[1];
        let diff = this.yS.invert(0) - this.yS.invert(tickSize);

        this.nTicksReal = 0;

        if (!diff) {
            return;
        }
        let toExp = diff.toExponential().split('e');
        let exp = toExp[1][0] === '+' ? +toExp[1].substr(1, toExp[1].length) : +toExp[1];

        this._yTicksFun(Math.pow(10, exp) * 5, g, t0, t1);
        if (this.nTicksReal > 5) {
            return;
        }
        g.selectAll('text').remove();
        this._yTicksFun(Math.pow(10, exp) * 2, g, t0, t1);
    }

    _initBrush() {
        let zoomed = false;

        let brushFun = () => {
            this.svg.selectAll('.tt').attr('display', 'none');
            this.svg.selectAll('.ttdot').attr('display', 'none');
        }

        let zoomIn = () => {
            if (!d3.event.selection) {
                return;
            }
            let span = d3.event.selection.map(this.xS.invert);
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

        this.g.append('g')
            .attr('class', 'xbrush')
            .attr('transform', 'translate(0 ' + this.props.marginTop + ')')
            .on("mousedown", () => { if (d3.event.button === 2) { d3.event.stopImmediatePropagation(); } })
            .call(this.brush)
            .selectAll('rect')
            .attr('height', this.height - this.props.marginTop - this.props.marginBottom)
            .attr('opacity', 0.4)
            .attr('stroke', null)
            .on('contextmenu', zoomOut);


    }

    _initChart() {
        this.xS = d3.scaleTime()
            .domain(this._getDomain(this.props.points, X_AXIS))
            .range([this.props.marginLeft, this.width - this.props.marginRight]);

        this.yS = d3.scaleLinear()
            .domain(this._getDomain(this.props.points, Y_AXIS))
            .range([this.height - this.props.marginBottom, this.props.marginTop]);

        this.lineFun = d3.line()
            .x((d) => this.xS(d[0]))
            .y((d) => this.yS(d[1]));

        this.svg = d3.select(this.refs.chart).html('').append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .datum(this.props.points);
        this.svg.append('rect')
            .attr('x', this.props.marginLeft)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', this.props.color);
        this.svg.append('text')
            .attr('x', this.props.marginLeft + 14)
            .attr('y', 10)
            .attr('fill', this.props.textColor)
            .text(this.props.name);
        this.svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(0 ' + (this.height - this.props.marginBottom) + ')');
        this.svg.append('g')
            .attr('class', 'yaxis')
            .attr('transform', 'translate(' + this.props.marginLeft + ' 0)');

        this.g = this.svg.append('g')
            .attr('class', 'series')
            .attr('clip-path', 'url(#clip)');

        this.g.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', this.props.marginLeft)
            .attr('width', this.width - this.props.marginLeft - this.props.marginRight)
            .attr('height', this.height);

        this.line = this.g.append('path')
            .attr('class', 'line')
            .style('fill', 'none')
            .style('stroke', this.props.color);

        this.dots = this.g.append('g')
            .attr('class', 'dots')
            .style('fill', this.props.color);

        this.dots.append('circle')
            .attr('class', 'ttdot')
            .attr('r', 3)
            .attr('fill', this.props.color)
            .attr('display', 'none')
            .attr('opacity', 0.4);
    }

    render() {
        return (
            <div className="chart" ref="chart"></div>
        )
    }
}

export default Chart;