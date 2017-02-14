import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import QueryStore from '../../Stores/QueryStore.jsx';
import QueryActions from '../../Actions/QueryActions.jsx';
import AutoCompletePopup from './AutoCompletePopup.jsx';
import ParseError from './ParseError.jsx';
import Result from './Result/Result.jsx';

const LAST_CHARS = /[a-z_]+$/;
const FIRST_CHARS = /^[a-z_]+/;
const SELECT_ALL = -1;
const HISTORY_SIZE = 100;

class Query extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = QueryStore;
        this.state = {
            query: '',
            queries: [],

            /* Auto Completion */
            keywords: [],
            xpos: 0,
            wpos: 0,
            selected: 0,
            show: false,

            /* Error Popup */
            parseRes: null
        };
        this.cursorPos = null;
        this.queries = JSON.parse(localStorage.getItem('queries')) || [];
        this.idx = this.queries.length;
    }

    onKeyPress(event) {
        if (event.key == 'Enter') {
            if (this.state.show) {
                this.onAutoCompleteSelect(this.state.selected);
            } else {
                this.onQuery();
            }
        }
    }

    setQuery(query) {
        this.setState({
            show: false,
            parseRes: null,
            query: query,
        });
        this.cursorPos = SELECT_ALL;
    }

    hideAutoComplete() {
        this.setState({ show: false, parseRes: null });
    }

    onAutoCompleteSelect(selected) {
        let text = this.state.keywords[selected].substring(this.state.wpos);
        let pos = this.refs.inp.selectionStart;
        let s = this.state.query;
        this.setState({
            show: false,
            parseRes: null,
            query: s.slice(0, pos) + text + s.slice(pos),
        });
        this.cursorPos = pos + text.length;
    }

    onKeyDown(event) {
        if (this.state.alert !== null) {
            QueryActions.clearAlert();
        }

        if (this.state.parseRes) {
            this.setState({ parseRes: null });
        }

        let n = this.state.keywords.length;

        if (this.state.show) {
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.setState({
                        selected: ((--this.state.selected % n) + n) % n
                    });
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.setState({
                        selected: (++this.state.selected) % n
                    });
                    break;
                case 'Tab':
                    event.preventDefault();
                case 'Enter':
                    break;
                default:
                    this.setState({ show: false, parseRes: null });
            }
        } else {
            if (event.key == 'Tab') {
                this.onTabPress(event);
            }
            if (event.key == 'ArrowUp' && this.idx > 0) {
                event.preventDefault();
                this.setQuery(this.queries[--this.idx]);

            }
            if (event.key == 'ArrowDown' && this.idx < this.queries.length) {
                event.preventDefault();
                this.setQuery(this.queries[++this.idx] || '');
            }
        }
    }

    _getWpos(keywords) {
        let wpos;
        for (wpos = 0; true; wpos++) {
            let j, p = keywords[0][wpos];
            for (j = 1; j < keywords.length; j++) {
                if (p !== keywords[j][wpos] || j > keywords[j].length) {
                    j = 0;
                    break;
                }
            }
            if (j !== keywords.length) {
                break;
            }
        }
        return wpos
    }

    onTabPress(event) {
        event.preventDefault();
        let pos = this.refs.inp.selectionStart;
        let left = this.state.query.substring(0, pos);
        let right = this.state.query.substring(pos);
        let lm = left.match(LAST_CHARS);
        let check = (lm) ? lm[0] : '';
        let rest = (check && (rest = right.match(FIRST_CHARS))) ? rest[0] : '';
        let parseResult = SiriGrammar.parse(left);
        if (lm === null) {
            lm = { index: pos };
        }
        if (parseResult.pos === lm.index) {
            let statement;
            let keywords = parseResult.expecting.filter((element) =>
                element instanceof jsleri.Keyword &&
                element.keyword.indexOf(check) === 0
            ).map((kw) => kw.keyword);
            if (keywords.length === 1) {
                statement = keywords[0].substring(check.length);
                this.setState({
                    query: this.state.query.slice(0, pos) + statement + this.state.query.slice(pos + rest.length)
                });
                this.cursorPos = pos + statement.length;
                return;
            }

            if (keywords.length > 1) {
                keywords.sort();
                let wpos = this._getWpos(keywords);
                statement = keywords[0].substring(0, wpos);
                this.cursorPos = pos + statement.length - check.length;
                this.setState({
                    query: this.state.query.slice(0, pos) + statement.slice(check.length) + this.state.query.slice(pos + rest.length),
                    keywords: keywords,
                    xpos: this.cursorPos,
                    wpos: wpos,
                    show: true,
                    selected: 0
                });
                return;
            }
        }
        if (!parseResult.isValid && pos !== parseResult.pos) {
            this.setState({ parseRes: parseResult });
        }
    }

    componentDidUpdate() {
        if (this.cursorPos !== null) {
            this.refs.inp.focus();
            if (this.cursorPos === SELECT_ALL) {
                this.refs.inp.selectionStart = 0;
            } else {
                this.refs.inp.selectionStart = this.refs.inp.selectionEnd = this.cursorPos;
            }
            this.cursorPos = null;
        }
    }

    onInpChange(event) {
        this.setState({
            query: event.target.value,
            parseRes: null,
            show: false
        });
    }

    onQuery() {
        if (this.state.query != this.queries[this.idx] &&
            this.state.query != this.queries[this.queries.length - 1]) {
            this.idx = this.queries.length;
            this.queries.push(this.state.query);
            if (this.queries.length > HISTORY_SIZE) {
                this.queries.shift();
                this.idx--;
            }
            localStorage.setItem('queries', JSON.stringify(this.queries));
        }
        QueryActions.query(this.state.query);
    }

    render() {
        let alert = (this.state.alert !== null) ? (
            <div className={`alert alert-${this.state.alert.severity}`}>{this.state.alert.message}</div>
        ) : null;

        return (
            <div>
                <div className="form">
                    <div className="form-group">
                        <div className="input-group input-group-sm">
                            <input
                                autoFocus
                                readOnly={this.state.sending}
                                type="text"
                                ref="inp"
                                className="form-control"
                                placeholder="your query..."
                                value={this.state.query}
                                onKeyPress={this.onKeyPress.bind(this)}
                                onKeyDown={this.onKeyDown.bind(this)}
                                onChange={this.onInpChange.bind(this)} />
                            <span className="input-group-btn">
                                <button
                                    disabled={this.state.sending}
                                    className="btn btn-default"
                                    type="button"
                                    onClick={this.onQuery.bind(this)}>
                                    <i className="fa fa-play"></i>
                                </button>
                            </span>
                            <AutoCompletePopup
                                keywords={this.state.keywords}
                                xpos={this.state.xpos}
                                wpos={this.state.wpos}
                                selected={this.state.selected}
                                show={this.state.show}
                                onSelect={this.onAutoCompleteSelect.bind(this)} />
                            {(this.state.parseRes !== null) ? <ParseError parseRes={this.state.parseRes} /> : null}
                        </div>
                    </div>
                    <ReactCSSTransitionGroup
                        component="div"
                        className="alert-wrapper"
                        transitionName="alert-animation"
                        transitionEnterTimeout={300}
                        transitionLeaveTimeout={500}>
                        {alert}
                    </ReactCSSTransitionGroup>
                </div>
                {
                    (this.state.sending) ? (
                        <img src="/static/img/loader.gif" alt="Loading bar" style={{ width: 20, height: 10 }} />
                    ) : (this.state.result) ? (
                        <Result result={this.state.result} setQuery={this.setQuery.bind(this)} />
                    ) : null
                }
            </div>
        )
    }
}

export default Query;