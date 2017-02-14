'use strict';

(function (d3) {

    var xDomainFun = function (d) {
        var span = window.d3.extent(d.map(function (d) { return d[0]; }));
        if (span[0]===span[1]) {
            span[0]--;
            span[1]++;
        }
        return span;
    };
    var yDomainFun = function (d) {
        var span = window.d3.extent(d.map(function (d) { return d[1]; }));
        if (span[0]===span[1]) {
            span[0]--;
            span[1]++;
        }
        return span;
    };

    function Chart (options, seriesname, points) {
        var self = {};

        self.xS = window.d3.scaleTime()
            .domain(xDomainFun(points))
            .range([options.margin.left, options.width-options.margin.right]);
        self.yS = window.d3.scaleLinear()
            .domain(yDomainFun(points))
            .range([options.height-options.margin.bottom, options.margin.top]);

        var lineFun = window.d3.line()
            .x(function (d) { return self.xS(d[0]); })
            .y(function (d) { return self.yS(d[1]); });

        self.draw = function () {
            self.svg.select('.xbrush')
                .call(brush);

            self.svg.select('.xaxis')
                .each(function () { xTicks(window.d3.select(this), self.xS, options); });

            self.svg.select('.yaxis')
                .each(function () { yTicks(window.d3.select(this), self.yS, options); });

            line.attr('d',  lineFun);

            var dotsCircle = dots.selectAll('circle').data(function (d) { return d; });
            dotsCircle.enter().append('circle').attr('r', 1.5);
            dotsCircle
                .attr('cx', function (d) { return self.xS(d[0]); })
                .attr('cy', function (d) { return self.yS(d[1]); });
        };


        self.div = window.d3.select(options.element);
        console.log(self.div, options.element);
        self.options = options;
        self.points = points;
        self.name = name;

        self.svg = self.div.append('svg')
            .attr('viewBox', '0 0 '+options.width+' '+options.height)
            .datum(points);
        self.svg.append('rect')
            .attr('x', options.margin.left)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', options.color);
        self.svg.append('text')
            .attr('x', options.margin.left+14)
            .attr('y', 10)
            .attr('fill', options.textcolor)
            .text(seriesname);
        self.svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate(0 '+(options.height-options.margin.bottom)+')');
        self.svg.append('g')
            .attr('class', 'yaxis')
            .attr('transform', 'translate('+options.margin.left+' 0)');

        self.g = self.svg.append('g')
            .attr('class', 'series')
            .attr('clip-path', 'url(#clip)');

        self.g.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
                .attr('x', options.margin.left)
                .attr('width', options.width-options.margin.left-options.margin.right)
                .attr('height', options.height);

        var line = self.g.append('path')
            .attr('class', 'line')
            .style('fill', 'none')
            .style('stroke', options.color);
        var dots = self.g.append('g')
            .attr('class', 'dots')
            .style('fill', options.color);
        self.g.append('circle')
            .attr('class', 'ttdot')
            .attr('r', 3)
            .attr('fill', options.color)
            .attr('display', 'none')
            .attr('opacity', 0.4);

        var brush = BrushArea(self);
        Tooltip(self);
        self.draw();

        return self;
    }

    function BrushArea(self) {
        var zoomed = false;

        var brush = window.d3.brushX()
            .extent([[0, 0], [Math.max(0, self.options.width-self.options.margin.left-self.options.margin.right), Math.max(0, self.options.height-self.options.margin.top-self.options.margin.bottom)]])
            .on('brush', brushFun)
            .on('end', zoomIn);

        function brushFun () {
            self.svg.selectAll('.tt').attr('display', 'none');
            self.svg.selectAll('.ttdot').attr('display', 'none');
        }

        function zoomIn () {
            if (!window.d3.event.selection) return;
            var span = window.d3.event.selection.map(self.xS.invert);
            if (self.xS(span[1])-self.xS(span[0]) < 10) return;
            zoomed = true;
            self.xS.domain(span);
            self.g.select('.xbrush').call(brush.move, null);
            self.draw();
        }

        function zoomOut () {
            window.d3.event.preventDefault();
            if (!zoomed) return;
            zoomed = false;
            self.xS.domain(xDomainFun(self.points));
            self.draw();
        }

        self.g.append('g')
            .attr('class', 'xbrush')
            .attr('transform', 'translate(0 '+self.options.margin.top+')')
            .on("mousedown", function() { if (window.d3.event.button === 2) window.d3.event.stopImmediatePropagation(); })
            .call(brush)
            .selectAll('rect')
                .attr('height', self.options.height-self.options.margin.top-self.options.margin.bottom)
                .attr('opacity', 0.4)
                .attr('stroke', null)
                .on('contextmenu', zoomOut);

        return brush;
    }

    function Tooltip(self) {
        var tFormat = window.d3.timeFormat('%Y-%m-%d %H:%M:%S');

        var ttOutFun = function () {
            tt.attr('display', 'none');
            self.svg.select('.ttdot').attr('display', 'none');
        };
        var ttMoveFun = function () {
            var pos = window.d3.mouse(this);
            var inv = self.xS.invert(pos[0]);
            var idx = self.points
                .map(function (d) { return Math.abs(d[0]-inv); })
                .reduce(function (minIdx, d, i, alist) { return d<alist[minIdx]?i:minIdx; }, 0);

            var x = pos[0]-160>0?pos[0]-160:pos[0]+10;
            var y = pos[1]-50>0?pos[1]-30:pos[1]+30;

            var pt = self.points[idx];

            tt
                .attr('transform', 'translate('+x+' '+y+')')
                .attr('display', 'inline');
            ttime.text(tFormat((new Date(pt[0]))));
            ttval.text(pt[1]);

            self.svg.select('.ttdot')
                .attr('cx', self.xS(pt[0]))
                .attr('cy', self.yS(pt[1]))
                .attr('display', 'inline');
        };


        var tt = self.svg.append('g')
            .attr('class', 'tt')
            .attr('display', 'none');
        tt.append('rect')
            .attr('class', 'ttbg')
            .attr('width', 150)
            .attr('height', 40);

        var ttime = tt.append('text')
            .attr('x', 4)
            .attr('y', 14)
            .attr('fill', self.options.textcolor);
        var ttval = tt.append('text')
            .attr('class', 'ttval')
            .attr('x', 4)
            .attr('y', 30)
            .attr('fill', self.options.textcolor);

        self.svg.select('.xbrush')
            .on('mousemove', ttMoveFun)
            .on('mouseout', ttOutFun);
    }

    function xTicks(g, xS, options) {
        var lineX = window.d3.line()
            .x(function (d) { return d[0]; })
            .y(function (d) { return d[1]; });

        g.html('').append('g').append('path').attr('d', lineX([[options.margin.left, 0], [options.width-options.margin.right, 0]]));
        var tickSize = 60;

        var t0 = xS.domain()[0]/1000;
        var t1 = xS.domain()[1]/1000;
        var dFormat = window.d3.timeFormat('%a %d %b');
        var hFormat = window.d3.timeFormat('%H:%M');
        var diff = (xS.invert(tickSize)-xS.invert(0))/1000;

        function ticksFun(val) {
            for (var i=t0-t0%val-7200; i<t1+1; i+=val) {
                var d = xS(i*1000);
                if (d>=xS.range()[0]) {
                    g.append('text')
                        .attr('x', d)
                        .attr('y', 16)
                        .attr('text-anchor', 'middle')
                        .attr('fill', options.textcolor)
                        .text(i%86400===86400-7200?dFormat(new Date(i*1000)):hFormat(new Date(i*1000)));
                }
            }
        }
        var gaps = [300, 600, 900, 1800, 3600, 7200, 10800, 14400, 28800, 43200, 86400, 86400*2, 86400*7];
        gaps.some(function (d) { if (diff < d) ticksFun(d); return diff < d; });
    }

    function yTicks(g, yS, options) {
        var lineY = window.d3.line()
            .x(function (d) { return d[0]; })
            .y(function (d) { return d[1]; });

        g.html('').append('g').append('path').attr('d', lineY([[0, options.margin.top], [0, options.height-options.margin.bottom]]));
        var tickSize = 20;

        var t0 = yS.domain()[0];
        var t1 = yS.domain()[1];
        var diff = yS.invert(0)-yS.invert(tickSize);

        var nTicksReal = 0;
        function ticksFun(val) {
            for (var i=t0-t0%val; i<t1+1; i+=val) {
                var d = yS(i);
                if (d<=yS.range()[0]&&d>=yS.range()[1]) {
                    g.append('text')
                        .attr('x', -10)
                        .attr('y', d)
                        .attr('text-anchor', 'end')
                        .attr('fill', options.textcolor)
                        .text(val < 1?i.toPrecision(1):i);
                }
                nTicksReal++;
            }
        }
        if (!diff) return;
        var toExp = diff.toExponential().split('e');
        var exp = toExp[1][0]==='+'?+toExp[1].substr(1, toExp[1].length):+toExp[1];

        ticksFun(Math.pow(10, exp)*5);
        if (nTicksReal > 5) return;
        g.selectAll('text').remove();
        ticksFun(Math.pow(10, exp)*2);
    }

    window.Chart = Chart;

}(window.d3));
