import React from 'react';
import Vlow from 'vlow';
import QueryStore from '../../Stores/QueryStore';
import QueryActions from '../../Actions/QueryActions';
import AutoCompletePopup from './AutoCompletePopup';
import ParseError from './ParseError';
import Result from './Result/Result';
import {Keyword} from 'jsleri';
import SiriGrammar from '../../Utils/SiriGrammar';

const LAST_CHARS = /[a-z_]+$/;
const FIRST_CHARS = /^[a-z_]+/;
const SELECT_ALL = -1;
const HISTORY_SIZE = 100;

class Query extends Vlow.Component {

    constructor(props) {
        super(props);
        this.siriGrammar = new SiriGrammar();
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
        this.mapStore(QueryStore);
        this.cursorPos = null;
        this.queries = JSON.parse(localStorage.getItem('queries')) || [];
        this.idx = this.queries.length;
    }

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            if (this.state.show) {
                this.handleAutoCompleteSelect(this.state.selected);
            } else {
                this.handleQuery();
            }
        }
    }

    componentWillUnmount() {
        QueryActions.clearAll();
        super.componentWillUnmount();
    }

    setQuery = (query) => {
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

    handleAutoCompleteSelect = (selected) => {
        this.setState((prevState) => {
            let text = prevState.keywords[selected].substring(prevState.wpos);
            let pos = this.inp.selectionStart;
            let s = prevState.query;

            this.cursorPos = pos + text.length;

            return {
                show: false,
                parseRes: null,
                query: s.slice(0, pos) + text + s.slice(pos)
            };
        });
    }

    handleKeyDown = (event) => {
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
                this.setState((prevState) => ({
                    selected: ((--prevState.selected % n) + n) % n
                }));
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.setState((prevState) => ({
                    selected: (++prevState.selected) % n
                }));
                break;
            case 'Tab':
                event.preventDefault();
                break;
            case 'Enter':
                break;
            default:
                this.setState({ show: false, parseRes: null });
            }
        } else {
            if (event.key === 'Tab') {
                this.onTabPress(event);
            }
            if (event.key === 'ArrowUp' && this.idx > 0) {
                event.preventDefault();
                this.setQuery(this.queries[--this.idx]);

            }
            if (event.key === 'ArrowDown' && this.idx < this.queries.length) {
                event.preventDefault();
                this.setQuery(this.queries[++this.idx] || '');
            }
        }
    }

    _getWpos(keywords) {
        let wpos;
        for (wpos = 0;; wpos++) {
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
        return wpos;
    }

    onTabPress(event) {
        event.preventDefault();
        let pos = this.inp.selectionStart;
        let left = this.state.query.substring(0, pos);
        let right = this.state.query.substring(pos);
        let lm = left.match(LAST_CHARS);
        let check = (lm) ? lm[0] : '';
        let rest = (check && (rest = right.match(FIRST_CHARS))) ? rest[0] : '';
        let parseResult = this.siriGrammar.parse(left);
        if (lm === null) {
            lm = { index: pos };
        }
        if (parseResult.pos === lm.index) {
            let statement;
            let keywords = parseResult.expecting.filter((element) =>
                element instanceof Keyword &&
                element.keyword.indexOf(check) === 0
            ).map((kw) => kw.keyword);
            if (keywords.length === 1) {
                statement = keywords[0].substring(check.length);
                this.setState((prevState) => ({
                    query: prevState.query.slice(0, pos) + statement + prevState.query.slice(pos + rest.length)
                }));
                this.cursorPos = pos + statement.length;
                return;
            }

            if (keywords.length > 1) {
                keywords.sort();
                let wpos = this._getWpos(keywords);
                statement = keywords[0].substring(0, wpos);
                this.cursorPos = pos + statement.length - check.length;
                this.setState((prevState) => ({
                    query: prevState.query.slice(0, pos) + statement.slice(check.length) + prevState.query.slice(pos + rest.length),
                    keywords: keywords,
                    xpos: this.cursorPos,
                    wpos: wpos,
                    show: true,
                    selected: 0
                }));
                return;
            }
        }
        if (!parseResult.isValid && pos !== parseResult.pos) {
            this.setState({ parseRes: parseResult });
        }
    }

    componentDidUpdate() {
        if (this.cursorPos !== null) {
            this.inp.focus();
            if (this.cursorPos === SELECT_ALL) {
                this.inp.selectionStart = 0;
            } else {
                this.inp.selectionStart = this.inp.selectionEnd = this.cursorPos;
            }
            this.cursorPos = null;
        }
    }

    handleInpChange = (event) => {
        this.setState({
            query: event.target.value,
            parseRes: null,
            show: false
        });
    }

    handleQuery = () => {
        if (this.state.alert !== null) {
            QueryActions.clearAlert();
        }
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
        this.cursorPos = SELECT_ALL;
        QueryActions.query(this.state.query);
    }

    mapRefInp = (el) => {
        this.inp = el;
    }

    render() {
        let alert = (this.state.alert !== null) ? (
            <div className="alert-wrapper">
                <div className={`alert alert-${this.state.alert.severity}`}>
                    {this.state.alert.message}
                </div>
            </div>
        ) : null;

        return (
            <div>
                <div className="form">
                    <div className="form-group">
                        <div className="input-group input-group-sm">
                            <input
                                autoFocus
                                className="form-control"
                                onChange={this.handleInpChange}
                                onKeyDown={this.handleKeyDown}
                                onKeyPress={this.handleKeyPress}
                                placeholder="your query..."
                                readOnly={this.state.sending}
                                ref={this.mapRefInp}
                                type="text"
                                value={this.state.query}
                            />
                            <span className="input-group-btn">
                                <button
                                    className="btn btn-default"
                                    disabled={this.state.sending}
                                    onClick={this.handleQuery}
                                    type="button"
                                >
                                    <i className="fa fa-play" />
                                </button>
                            </span>
                            <AutoCompletePopup
                                keywords={this.state.keywords}
                                onSelect={this.handleAutoCompleteSelect}
                                selected={this.state.selected}
                                show={this.state.show}
                                wpos={this.state.wpos}
                                xpos={this.state.xpos}
                            />
                            {(this.state.parseRes !== null) ? <ParseError parseRes={this.state.parseRes} /> : null}
                        </div>
                    </div>
                    {alert}
                </div>
                {
                    (this.state.sending) ? (
                        <img
                            alt="Loading bar"
                            src="/img/loader.gif"
                            style={{ width: 20, height: 10 }}
                        />
                    ) : (this.state.result) ? (
                        <Result
                            result={this.state.result}
                            setQuery={this.setQuery}
                        />
                    ) : null
                }
            </div>
        );
    }
}

export default Query;