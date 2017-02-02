/* global $, moment */

'use strict';



$(document).ready(function () {

    // Close menu on click while in mobile view
    $('.navbar-collapse a').click(function () {
        if ($('.navbar-collapse').is(':visible') && $('.navbar-toggle').is(':visible')) {
            $('.navbar-collapse').collapse('toggle');
        }
    });


});


(function (oz, showdown, SiriGrammar, Keyword, Regex, Token, Tokens) {
    var app = {};

    app.history = [];
    app.historyPos = 0;
    app.addToHistory = false;
    app.historyMax = 100;

    app.applyCode = function () {
        $('#contentholder code').not('pre > code').addClass('pointer').click(function () {
            app.setQuery($(this).text());
        });
    };

    var formatTimestamp = function (timestamp) {
        var factor = {
            s: 1e3,
            ms: 1e0,
            us: 1e-3,
            ns: 1e-6
        }[app.db.time_precision];
        return moment(Math.floor(timestamp * factor)).utc().format('YYYY-MM-DD HH:mm:ss') + 'Z';
    };

    app.openModal = function () {
        $('#modal-database').html(app.db.dbname);
        $('#modal-version').html(app.db.version);
    };

    app.setSeriesQuery = function (seriesName) {
        $('#query').val('select * from "' + seriesName + '" after now - 1h').select().focus();
        app.addToHistory = true;
    };

    app.setGroupQuery = function (groupName) {
        $('#query').val('list series `' + groupName + '`').select().focus();
        app.addToHistory = true;
    };

    app.setQuery = function (query) {
        $('#query').val(query).select().focus();
        app.addToHistory = true;
        if (query.indexOf('help') === 0) {
            app.runQuery();
        }
    };

    app.runQuery = function () {
        $('#btn-run-query').prop('disabled', true);
        $('#query').prop('disabled', true);

        var query = $('#query').val().trim();

        if (app.addToHistory) {
            app.history.push(query);
            if (app.history.length > app.historyMax) {
                app.history.shift();
            }
            app.historyPos = app.history.length-1;
        }

        var resetView = function () {
            $('#messageholder').html('');
            $('#contentholder').html('');
            $('#btn-run-query').prop('disabled', false);
            $('#query').prop('disabled', false).focus().select();
            $(window).off('resize');
            app.addToHistory = false;
        };

        var plot = function (series) {
            var factor = {
                s: 1e3,
                ms: 1e0,
                us: 1e-3,
                ns: 1e-6
            }[app.db.time_precision];

            for (var i=0, l=series.points.length; i < l; i++) {
                series.points[i][0] *= factor;
            }

            var previous;
            var elem = $('<div>').addClass('chart').bind('plothover', function (event, pos, item) {
                if (!item) {
                    $('#tooltip').remove();
                    previous = undefined;
                    return;
                }
                if (item.datapoint[0] === previous) {
                    return;
                }
                previous = item.datapoint[0];
                $('#tooltip').remove();
                if (item) {
                    var date = moment(item.series.data[item.dataIndex][0]);
                    var formatted = date.format('YYYY-MM-DD HH:mm:ss');
                    var tooltip = formatted + '<br /><strong>' + item.series.data[item.dataIndex][1] + '</strong>';

                    var showTooltip = function (x, y, tooltip) {

                        $('<div id="tooltip">' + tooltip + '</div>')
                            .css({
                                'z-index': '2000',
                                position: 'absolute',
                                display: 'none',
                                top: y - 55,
                                left: x - 80,
                                border: '1px solid #50636b',
                                'text-align': 'center',
                                'border-radius': '0px',
                                padding: '2px 10px',
                                color: '#fff',
                                'background-color': '#50636b',
                                opacity: 0.85 })
                            .appendTo('body').fadeIn(200);
                    };

                    showTooltip(item.pageX, item.pageY, tooltip);
                }
            });

            $('#contentholder').append(elem);

            var options = {
                series: {
                    lines: { show: true, steps: false },
                    points: { show: true },
                },
                xaxis: {
                    mode: 'time',
                    timeformat: '%Y/%m/%d',
                    font: {
                        color: '#d4dee1'
                    }
                },
                yaxis: {
                    font: {
                        color: '#d4dee1'
                    }
                },
                grid: {
                    color: '#d4dee1',
                    hoverable: true,
                    clickable: true,
                    borderWidth: 1,
                    borderColor: '#d4dee1'
                },
                points: {
                    radius: 1
                },
                legend: {
                    noColumns: 2,
                    labelBoxBorderColor: '#7898a0',
                    backgroundColor: null,
                    backgroundOpacity: 0,
                    position: 'ne',
                    margin: [0, -20],
                    padding: [5, 5]
                }
            };

            var data = [{
                label: series.name,
                data: series.points,
                color: '#fe9e1e'
            }];

            elem.plot(data, options);
            $(window).resize(function() { elem.plot(data, options); });

        };

        var table = function (caption, columns, data, tipe) {

            var insertRows = function (data) {
                var s = '';
                $.each(data, function (i, row) {
                    if (row instanceof Array) {
                        var temp = {};
                        $.each(columns, function (i, column) {
                            temp[column] = row[i];
                        });
                        row = temp;
                    }
                    s += '<tr>';
                    $.each(columns, function (i, column) {
                        if (column == 'name' && tipe == 'series') {
                            s += '<td><a onclick="app.setSeriesQuery(\'' + row[column] + '\')"><i class="fa fa-clipboard"></i></a> ' + row[column] + '</td>';

                        } else if (column == 'name' && tipe == 'groups') {
                            s += '<td><a onclick="app.setGroupQuery(\'' + row[column] + '\')"><i class="fa fa-clipboard"></i></a> ' + row[column] + '</td>';

                        } else if (((tipe == 'show' && row.name == 'uptime' && column == 'value') ||
                                    (tipe == 'servers' && column == 'uptime')) &&
                                    (typeof row[column] !== 'string') ) {
                            s += '<td>' + moment.duration(row[column], 'seconds').humanize() + '</td>';

                        } else if (((tipe == 'show' && row.name == 'received_points' && column == 'value') ||
                                    (tipe == 'servers' && column == 'received_points')) &&
                                    (typeof row[column] !== 'string') ) {
                            s += '<td>' + oz.formatLongNumber(row[column]) + '</td>';

                        } else if (((tipe == 'show' && row.name == 'buffer_size' && column == 'value') ||
                                    (tipe == 'servers' && column == 'buffer_size')) &&
                                    (typeof row[column] !== 'string') ) {
                            s += '<td>' + oz.formatSize(row[column]) + '</td>';

                        } else if (((tipe == 'show' && row.name == 'mem_usage' && column == 'value') ||
                                    (tipe == 'servers' && column == 'mem_usage')) &&
                                    (typeof row[column] !== 'string') ) {
                            s += '<td>' + oz.formatSize(row[column]*1024*1024) + '</td>';

                        } else if (tipe == 'show' && row.name == 'drop_threshold' && column == 'value') {
                            s += '<td>' + row[column] + ' (' + (parseInt(row[column] * 100).toString()) + '%)' + '</td>';

                        } else if (((tipe == 'show' && row.name == 'startup_time' && column == 'value') ||
                                    (tipe == 'servers' && column == 'startup_time')) &&
                                    (typeof row[column] !== 'string') ) {
                            var seconds = Math.ceil(row[column]);
                            s += '<td>' + seconds + ((seconds === 1) ? ' second' : ' seconds') + '</td>';

                        } else if (tipe == 'shards' && (column == 'start' || column == 'end')) {
                            s += '<td>' + formatTimestamp(row[column]) + '</td>';

                        } else if (tipe == 'series' && (column == 'start' || column == 'end')) {
                            s += '<td>' + formatTimestamp(row[column]) + '</td>';

                        } else if (tipe == 'points' && (column == 'timestamp')) {
                            s += '<td>' + formatTimestamp(row[column]) + '</td>';

                        } else if (tipe == 'shards' && (column == 'start' || column == 'size')) {
                            s += '<td>' + oz.formatSize(row[column]) + '</td>';

                        } else {
                            s += '<td>' + row[column] + '</td>';
                        }
                    });
                    s += '</tr>';
                });
                return s;
            };

            $('#contentholder').append([
                '<table class="table table-striped table-condensed">',
                    (caption) ? '<caption><div style="border:1px solid #7898a0;padding:1px;float:left;margin-right:5px"><div style="width:4px;height:0;border:5px solid #fe9e1e;overflow:hidden"></div></div>' + caption + '</caption>' : '',
                    '<thead>',
                        '<tr>',
                            function (columns) {
                                var s = '';
                                $.each(columns, function (i, column) {
                                    s += '<th>' + column + '</th>';
                                });
                                return s;
                            }(columns),
                        '</tr>',
                    '</thead>',
                    '<tbody>',
                        insertRows(data),
                    '</tbody>',
                '</table>'
            ].join(''));

        };

        var renderTimeit = function (data, nPoints, items) {
            var infoBox = $('<div class="alert alert-info">');

            if (nPoints) {
                infoBox.text('Got ' + nPoints.toString() + ' ' + items + (nPoints > 1 ? 's' : '') + ' in ' + data.__timeit__[data.__timeit__.length-1].time.toFixed(3) + ' seconds');
            } else {
                infoBox.text('Query time: ' + data.__timeit__[data.__timeit__.length-1].time.toFixed(3) + ' seconds');
            }

            infoBox.append([
                '<dl class="dl-horizontal">',
                    function (timeits) {
                        var s = '';
                        $.each(timeits, function (i, timeit) {
                            s += '<dt>' + timeit.time.toFixed(3) + '</dt><dd>' + timeit.server + '</dd>';
                        });
                        return s;
                    }(data.__timeit__),
                '</dl>'
            ].join(''));

            $('#contentholder').append(infoBox);
        };

        var renderData = function (data, showPlots, nPoints) {

            if (data.columns !== undefined && typeof data.columns[0] === 'string') {
                /* This is a List response */
                if (data.__timeit__ !== undefined) {
                    renderTimeit(data, nPoints, 'row');
                    delete data.__timeit__;
                }

                if (data.pools !== undefined) {
                    var pools = oz.sortOn(data.pools, data.columns.indexOf('pool'));
                    return table(null, data.columns, pools, 'pools');
                }

                if (data.networks !== undefined) {
                    return table(null, data.columns, data.networks);
                }

                if (data.users !== undefined) {
                    var users = oz.sortOn(data.users, data.columns.indexOf('user'));
                    return table(null, data.columns, users, 'users');
                }

                if (data.shards !== undefined) {
                    var shards = oz.sortOn(data.shards, data.columns.indexOf('sid')).reverse();
                    return table(null, data.columns, shards, 'shards');
                }

                if (data.servers !== undefined) {
                    var servers = oz.sortOn(data.servers, data.columns.indexOf('name'));
                    return table(null, data.columns, servers, 'servers');
                }

                if (data.series !== undefined) {
                    var series = oz.sortOn(data.series, data.columns.indexOf('name'));
                    return table(null, data.columns, series, 'series');
                }

                if (data.groups !== undefined) {
                    var groups = oz.sortOn(data.groups, data.columns.indexOf('name'));
                    return table(null, data.columns, groups, 'groups');
                }
            }

            if (data.__timeit__ !== undefined) {
                renderTimeit(data, nPoints, 'point');
                delete data.__timeit__;
            }

            if (data.success_msg !== undefined && typeof data.success_msg === 'string')
                return $('#contentholder').append('<div class="alert alert-success">' + data.success_msg + '</div>');

            if (data.pools !== undefined && !isNaN(data.pools))
                return $('#contentholder').append('<div class="alert alert-info">' + data.pools.toString() + '</div>');

            if (data.pools_servers !== undefined && !isNaN(data.pools_servers))
                return $('#contentholder').append('<div class="alert alert-info">' + data.pools_servers.toString() + '</div>');

            if (data.users !== undefined && !isNaN(data.users))
                return $('#contentholder').append('<div class="alert alert-info">' + data.users.toString() + '</div>');

            if (data.servers !== undefined && !isNaN(data.servers))
                return $('#contentholder').append('<div class="alert alert-info">' + data.servers.toString() + '</div>');

            if (data.groups !== undefined && !isNaN(data.groups))
                return $('#contentholder').append('<div class="alert alert-info">' + data.groups.toString() + '</div>');

            if (data.servers_open_files !== undefined && !isNaN(data.servers_open_files))
                return $('#contentholder').append('<div class="alert alert-info">' + data.servers_open_files.toString() + '</div>');

            if (data.networks !== undefined && !isNaN(data.networks))
                return $('#contentholder').append('<div class="alert alert-info">' + data.networks.toString() + '</div>');

            if (data.shards !== undefined && !isNaN(data.shards))
                return $('#contentholder').append('<div class="alert alert-info">' + data.shards.toString() + '</div>');

            if (data.series !== undefined && !isNaN(data.series))
                return $('#contentholder').append('<div class="alert alert-info">' + oz.formatLongNumber(data.series) + '</div>');

            if (data.groups_series !== undefined && !isNaN(data.groups_series))
                return $('#contentholder').append('<div class="alert alert-info">' + oz.formatLongNumber(data.groups_series) + '</div>');

            if (data.pools_series !== undefined && !isNaN(data.pools_series))
                return $('#contentholder').append('<div class="alert alert-info">' + oz.formatLongNumber(data.pools_series) + '</div>');

            if (data.series_length !== undefined && !isNaN(data.series_length))
                return $('#contentholder').append('<div class="alert alert-info">' + oz.formatLongNumber(data.series_length) + '</div>');

            if (data.servers_received_points !== undefined && !isNaN(data.servers_received_points))
                return $('#contentholder').append('<div class="alert alert-info">' + oz.formatLongNumber(data.servers_received_points) + '</div>');

            if (data.servers_mem_usage !== undefined && !isNaN(data.servers_mem_usage))
                return $('#contentholder').append('<div class="alert alert-info">' + oz.formatSize(data.servers_mem_usage*1024*1024) + '</div>');

            if (data.shards_size !== undefined && !isNaN(data.shards_size))
                return $('#contentholder').append('<div class="alert alert-info">' + oz.formatSize(data.shards_size) + '</div>');

            if (data.calc !== undefined && !isNaN(data.calc)) {
                var factor = {
                    s: 1e0,
                    ms: 1e-3,
                    us: 1e-6,
                    ns: 1e-9
                }[app.db.time_precision];
                var seconds = parseInt(data.calc * factor);
                var text;
                if (seconds < 315532800) {
                    text = moment.duration(seconds, 'seconds').humanize();
                } else {
                    text = formatTimestamp(data.calc);
                }
                var elem = $('<span data-toggle="tooltip" data-placement="bottom" title="' + text + '">' + data.calc.toString() + '</span>').tooltip().click(function () {
                    $(this).tooltip('hide');
                });
                var ediv = $('<div class="alert alert-info"></div>');
                elem.appendTo(ediv);
                return $('#contentholder').append(ediv);
            }

            if (data.data !== undefined &&
                data.data instanceof Array &&
                data.data.length &&
                data.data[0].name !== undefined)
                return table(null, ['name', 'value'], data.data, 'show');

            if (data.help && typeof data.help === 'string') {
                var converter = new showdown.Converter();
                var helpContent = $('<div>').addClass('help-content');
                helpContent.append(converter.makeHtml(data.help));
                $('#contentholder').append(helpContent).find('pre').each(function (i, elem) {
                    var code = $(elem).children('code').first().html().split('\n');
                    var n, nn, l, ll, line, nodeResult, nodes, node, elmt;
                    for (n = 0, l = code.length; n < l; n++) {
                        line = code[n].replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');
                        nodeResult = SiriGrammar.parse(line);
                        if (nodeResult.isValid) {
                            nodes = [];
                            walkTree(nodeResult.tree, nodes);
                            nodes.reverse();
                            for (nn = 0, ll = nodes.length; nn < ll; nn++) {
                                node = nodes[nn];
                                if (node.element instanceof Keyword)
                                    elmt = '<span class="siri-keyword">' + node.str + '</span>';
                                else if (node.element instanceof Regex) {
                                    if (node.str[0] == '#')
                                        elmt = '<span class="siri-comment">' + node.str + '</span>';
                                    else if (node.str[0] == '\'' || node.str[0] == '"')
                                        elmt = '<span class="siri-string">' + node.str + '</span>';
                                    else
                                        elmt = '<span class="siri-regex">' + node.str + '</span>';
                                } else if (node.element instanceof Token || node.element instanceof Tokens) {
                                    elmt = '<span class="siri-token">' + node.str + '</span>';
                                }
                                line = spliceSlice(line, node.start, node.end, elmt);
                            }
                            code[n] = line;
                        }
                    }
                    $(elem).children('code').first().html(code.join('\n'));
                });
                app.applyCode();
                return;
            }

            if (showPlots) renderPlots(data);

            return;
        };

        var renderPlots = function (data) {
            for (var name in data) {
                if (!data[name].length) {
                    $('#contentholder').append('<div class="alert alert-info">the current query for ' + name + ' has no results</div>');
                } else if (typeof data[name][0][1] !== 'string') {
                    plot({name: name, points: data[name]});
                } else {
                    table(name, ['timestamp', 'value'], data[name], 'points');
                }
            }
        };

        var countPoints = function (data) {
            var nPoints = 0;
            for (var key in data) {
                if (data[key] instanceof Array && data[key].length && data[key][0] instanceof Array) {
                    nPoints += data[key].length;
                }
            }
            return nPoints;
        };

        $.ajax({
            url: '/query',
            method: 'POST',
            data: query,
            headers: {
                'Authorization': 'Token ',
                'Content-Type': 'application/json'
            }
        }).done(function (data) {
            resetView();
            var nPoints = countPoints(data),
                showPlots = nPoints < 10000;
            if (!showPlots) {
                var warning = $('<div class="alert alert-warning">').html('We have found <strong>' + nPoints + '</strong> points. Rendering this data can take up a long time...<br /><br />');
                var button = $('<button>').addClass('btn btn-primary').text('just show the data').click(function () {
                    $('#contentholder').html('');
                    renderPlots(data);
                });
                warning.append(button);
                $('#contentholder').append(warning);
            }
            renderData(data, showPlots, nPoints);

        }).error(function (xhr) {
            if (xhr.status == 422) {
                window.location.hash = '#no-connection';
            } else {
                resetView();
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.hasOwnProperty('error_msg')) {
                        $('#contentholder').append('<div class="alert alert-warning">' + data.error_msg + '</div>');
                    }
                } catch (e) {
                    $('#messageholder').html('<div class="alert alert-danger">Some error occurred, please see the console for more details.</div>');
                }
            }
        });
    };

    function walkTree (tree, nodes) {
        if (tree.element instanceof Keyword || tree.element instanceof Regex || tree.element instanceof Token || tree.element instanceof Tokens) {
            nodes.push(tree);
        }
        for (var i = 0, l = tree.children.length; i < l; i ++) {
            walkTree(tree.children[i], nodes);
        }
    }

    function spliceSlice(str, start, end, add) {
        return str.slice(0, start) + (add || '') + str.slice(end);
    }

    app.runInsert = function (insertType, target) {
        var data = $(target).parent().find('textarea').first().val().trim();

        $.ajax({
            url: '/insert',
            method: 'POST',
            data: data,
            contentType: insertType + '; charset=UTF-8'
        }).done(function (data) {
            if (insertType == 'text/csv' && data.indexOf('Successfully') != -1) {
                data = {'success_msg': data};
            }

            if (data.hasOwnProperty('success_msg')) {
                $('#insert-message-container').html([
                    '<div class="alert alert-success">',
                        '<a href="#" class="close" data-dismiss="alert">&times;</a>',
                        '<strong>Success!</strong> ' + data.success_msg,
                    '</div>'
                ].join(''));
            } else {
                window.console.error(data);
            }
        }).error(function (xhr) {
            if (xhr.status == 422) {
                window.location.hash = '#no-connection';
            } else {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.hasOwnProperty('error_msg')) {
                        $('#insert-message-container').html([
                            '<div class="alert alert-danger">',
                                '<a href="#" class="close" data-dismiss="alert">&times;</a>',
                                '<strong>Error!</strong> ' + data.error_msg,
                            '</div>'
                        ].join(''));
                    }
                } catch (e) {
                    $('#insert-message-container').html('<div class="alert alert-danger">Some error occurred, please see the console for more details.</div>');
                }
            }
        });
    };

    window.app = app;

})(window.oz, window.showdown, window.SiriGrammar, window.jsleri.Keyword, window.jsleri.Regex, window.jsleri.Token, window.jsleri.Tokens);
