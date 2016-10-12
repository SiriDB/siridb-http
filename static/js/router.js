'use strict';

// For production we include this file in app.min.js

(function (
        routie,
        $,
        app,
        moment,
        oz,
        SiriGrammar,
        Keyword
    ) {

    var LAST_CHARS = /[a-z_]+$/;
    var FIRST_CHARS = /^[a-z_]+/;

    var autoCompletionIndex = -1,
        autoCompletionLength = 0;

    var autoCompletion = function (inp, checkValid) {
        if (inp.selectionStart !== inp.selectionEnd)
            return;

        var $inp,
            pos,
            query,
            i,
            j,
            l,
            p,
            lm,
            left,
            right,
            rest,
            statement,
            check,
            element,
            keywords,
            parseResult;

        $inp = $(inp);
        pos = inp.selectionStart;
        query = $inp.val();
        left = query.substring(0, pos);
        right = query.substring(pos);
        lm = left.match(LAST_CHARS);

        check = (lm) ? lm[0] : '';
        rest = (check && (rest = right.match(FIRST_CHARS))) ? rest[0] : '';
        if (lm === null) lm = {index: pos};

        parseResult = SiriGrammar.parse(left);

        if ((checkValid === undefined || !parseResult.isValid) && parseResult.pos === lm.index) {

            keywords = [];
            for (i = 0, l = parseResult.expecting.length; i < l; i++) {
                element = parseResult.expecting[i];
                if (element instanceof Keyword) {
                    if (element.keyword.indexOf(check) === 0) {
                        keywords.push(element.keyword);
                    }
                }
            }
            keywords.sort();
            l = keywords.length;
            if (l == 1) {
                statement = keywords[0].substring(check.length);
                $inp.val(query.slice(0, pos) + statement + query.slice(pos));
                pos += statement.length;
                inp.selectionStart = pos;
                inp.selectionEnd = pos;
                app.insertSpace();
                // autoCompletion(inp, false);
            } else if (l > 1) {
                for (i=0; true; i++) {
                    p = keywords[0][i];
                    for (j=1; j < l; j++) {
                        if (p !== keywords[j][i] || j > keywords[j].length ) {
                            j = 0;
                            break;
                        }
                    }
                    if (j !== l) {
                        break;
                    }
                }
                statement = keywords[0].substring(0, i);
                $inp.val(query.slice(0, pos) + statement.slice(check.length) + query.slice(pos + rest.length));
                pos += (statement.length - check.length);
                inp.selectionStart = pos;
                inp.selectionEnd = pos;
                autoCompletionIndex = -1;
                autoCompletionLength = l;
                $('#autocomplete-popup').css('left', Math.min(14 + (pos*7), $inp.width())).show().children('ul').html(function (stmts, l, pos) {
                    var s = '';
                    for (var i=0; i < l; i++) {
                        s +=
                            '<li data-index="' + i + '" onclick="app.insertText(\'' + keywords[i].substring(pos)  + '\', 0)">' +
                                '<span class="grey">' + keywords[i].substring(0, pos) + '</span>' +
                                keywords[i].substring(pos) +
                            '</li>';
                    }
                    return s;
                }(keywords, l, i)).children('li').hover(function () {
                    $('#autocomplete-popup ul').children('li').removeClass('selected-auto-complete');
                    autoCompletionIndex = $(this).addClass('selected-auto-complete').data('index');
                });
            }
        }
    };

    var insertInto = function (inp, svalue, evalue, cursor) {
        var $inp = $(inp);
        var s = $inp.val();
        var pos = inp.selectionStart;
        var isSelected = inp.selectionStart !== inp.selectionEnd;

        if (!isSelected && s[pos] == evalue) {
            inp.selectionStart++;
            return;
        }

        $inp.val(s.slice(0, inp.selectionStart) + svalue + s.slice(inp.selectionStart, inp.selectionEnd) + evalue + s.slice(inp.selectionEnd));
        if (isSelected) {
            inp.selectionStart = pos;
            inp.selectionEnd++;
        } else {
            inp.selectionEnd = inp.selectionStart = pos + cursor;
        }
    };

    var queryViewCallback = function () {
        app.applyCode();

        $('#contentholder .name-holder').html(app.db.who_am_i);

        app.historyPos = app.history.length;
        $('#query').select().focus().keypress(function (event) {
            var ch = String.fromCharCode(event.which);
            if (ch === '(') {
                event.preventDefault();
                insertInto(this, '(', ')', 1);
            } else if (ch === '`') {
                event.preventDefault();
                insertInto(this, '`', '`', 1);
            } else if (ch === '"') {
                event.preventDefault();
                insertInto(this, '"', '"', 1);
            } else if (ch === '\'') {
                event.preventDefault();
                insertInto(this, '\'', '\'', 1);
            } else if (ch === ')') {
                event.preventDefault();
                insertInto(this, '', ')', 1);
            }
        });

        $('#query').select().focus().keydown(function (event) {
            var popup = $('#autocomplete-popup');
            var isPopup = popup.is(':visible');
            var autoselected;
            if (event.keyCode === 10 || event.keyCode === 13) {
                event.preventDefault();
                if (!isPopup)
                    app.runQuery();
                else if (autoCompletionIndex >= 0)
                    $('.selected-auto-complete').click();
            } else if (event.keyCode === 38) {
                event.preventDefault();
                if (!isPopup && app.historyPos) {
                    app.historyPos -= 1;
                    $(this).val(app.history[app.historyPos]).select().focus();
                    app.addToHistory = false;
                } else if (isPopup) {
                    autoselected = popup.find('.selected-auto-complete').removeClass('selected-auto-complete');
                    if (autoCompletionIndex <= 0) {
                        autoCompletionIndex = popup.find('li:last').addClass('selected-auto-complete').data('index');
                    } else {
                        autoselected.prev().addClass('selected-auto-complete');
                        autoCompletionIndex--;
                    }
                }
            } else if (event.keyCode === 40) {
                event.preventDefault();
                if (!isPopup && app.historyPos < app.history.length) {
                    app.historyPos += 1;
                    if (app.historyPos < app.history.length) {
                        $(this).val(app.history[app.historyPos]).select().focus();
                        app.addToHistory = false;
                    } else {
                        $(this).val('');
                    }
                } else if (isPopup) {
                    autoselected = popup.find('.selected-auto-complete').removeClass('selected-auto-complete');
                    if (autoCompletionIndex === -1 || autoCompletionIndex >= autoCompletionLength - 1) {
                        autoCompletionIndex = popup.find('li:first').addClass('selected-auto-complete').data('index');
                    } else {
                        autoselected.next().addClass('selected-auto-complete');
                        autoCompletionIndex++;
                    }
                }
            } else if (event.keyCode === 9) {
                event.preventDefault();
                popup.hide();
                autoCompletion(this);
            } else {
                popup.hide();
                app.addToHistory = true;
            }
        });
    };

    app.render = function (view, callback) {
        if (app.db) {
            $(window).off('resize');
            var $view = $(view);
            if ($view.length) {
                $('#view').html($view.html());
            }
            $('.navbar-nav li').removeClass('active');
            $('.navbar-nav li[data-target="' + view + '"]').addClass('active');
            if (callback) { callback(); }
        } else {
            $.getJSON('/db-info', function (db) {
                app.db = db;
                app.render(view, callback);
            });
        }

    };

    app.insertSpace = function () {
        var $inp = $('#query');
        var inp = $inp[0];
        var pos = inp.selectionStart;
        var s = $inp.val();
        if (s[pos] !== ' ') {
            $inp.val(s.slice(0, pos) + ' ' + s.slice(pos));
        }
        inp.selectionStart = pos + 1;
        inp.selectionEnd = inp.selectionStart;
    };

    app.insertText = function (text, cursor) {
        $('#autocomplete-popup').hide();
        var $inp = $('#query');
        var inp = $inp[0];
        var pos = inp.selectionStart;
        var s = $inp.val();
        $inp.val(s.slice(0, pos) + text + s.slice(pos));
        $inp.focus();
        inp.selectionStart = pos + text.length + cursor;
        inp.selectionEnd = inp.selectionStart;
        app.insertSpace();
    };

    app.queryView = function () {
        app.render('#query-view', queryViewCallback);
    };

    var showInsert = function () {
        $('#insert-form-json-array,#insert-form-json-object,#insert-form-csv-flat,#insert-form-csv-table').hide();
        $('#insert-form-' + $('input[name=insert-type]:checked').val()).show();
    };

    app.insertView = function () {
        app.render('#insert-view', function () {
            $('input[name=insert-type]').change(showInsert);
            showInsert();
            var factor = {
                s: 1e-3,
                ms: 1e0,
                us: 1e3,
                ns: 1e6
            }[app.db.time_precision];

            $('#insert-csv-table').val(',"series-001"\n' + Math.floor(moment() * factor) + ',' + Math.floor((Math.random() * 100) + 1) + '\n');
            $('#insert-csv-flat').val('"series-001",' + Math.floor(moment() * factor) + ',' + Math.floor((Math.random() * 100) + 1) + '\n');
            $('#insert-csv-table,#insert-csv-flat').keydown(function (event) {
                if (event.ctrlKey && (event.keyCode == 10 || event.keyCode == 13)) {
                    app.runInsert('text/csv', $(event.target).parent().parent().find('button').first());
                }
            });
            $('#insert-json-array').val('[\n\t{\n\t\t"name": "series-001",\n\t\t"points": [\n\t\t\t[' + Math.floor(moment() * factor) + ', ' + Math.floor((Math.random() * 100) + 1) + ']\n\t\t]\n\t}\n]');
            $('#insert-json-object').val('{\n\t"series-001": [\n\t\t[' + Math.floor(moment() * factor) + ', ' + Math.floor((Math.random() * 100) + 1) + ']\n\t]\n}');
            $('#insert-json-array,#insert-json-object').keydown(function (event) {
                var $this = $(this);
                var value = $this.val();

                if (event.ctrlKey && (event.keyCode == 10 || event.keyCode == 13)) {
                    app.runInsert('application/json', event.target);
                }
                if (event.which == 9) {
                    event.preventDefault();
                    // get caret position/selection
                    var start = this.selectionStart;
                    var end = this.selectionEnd;

                    // set textarea value to: text before caret + tab + text after caret
                    $this.val(value.substring(0, start) + '\t' + value.substring(end));

                    // put caret at right position again (add one for the tab)
                    this.selectionStart = this.selectionEnd = start + 1;
                }
            }).keyup(function () {
                try {
                    JSON.parse($(this).val());
                    $(event.target).parent().removeClass('has-error');
                    $(event.target).parent().parent().find('button').first().prop('disabled', false);
                } catch (e) {
                    $(event.target).parent().addClass('has-error');
                    $(event.target).parent().parent().find('button').first().prop('disabled', true);
                }
            });
            $('#insert-json-object').select().focus();
        });
    };

    routie({
        '': function () { app.queryView(); },
        'query': function () { app.queryView(); },
        'insert': function () { app.insertView(); },
        '*': function () { app.render('#page-not-found-view'); }
    });

})(
    window.routie,
    window.jQuery,
    window.app,
    window.moment,
    window.oz,
    window.SiriGrammar,
    window.jsleri.Keyword,
    window.jsleri.Token
);
