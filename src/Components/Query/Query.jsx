import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import localstorage from 'react-localstorage';
import QueryStore from '../../Stores/QueryStore.jsx';
import QueryActions from '../../Actions/QueryActions.jsx';
import AutoCompletePopup from './AutoCompletePopup.jsx';


const LAST_CHARS = /[a-z_]+$/;
const FIRST_CHARS = /^[a-z_]+/;

class Auth extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = QueryStore;
        this.state = {
            query: '',
            queries: []
        };
    }

    onKeyPress(event) {
        console.log(event.key);
        if (event.key == 'Enter') {
            this.onQuery();
        }
    }

    onKeyDown(event) {
        console.log(event.key);
        if (this.state.alert !== null) {
            QueryActions.clearAlert();
        }
        if (event.key == 'Tab') {
            this.onTabPress(event);
        }
    }

    onTabPress(event) {
        event.preventDefault();
        let pos = this.refs.inp.selectionStart;
        let left = this.state.query.substring(0, pos);
        let right = this.state.query.substring(pos);
        let lm = left.match(LAST_CHARS);
        let check = (lm) ? lm[0] : '';
        let rest = (check && (rest = right.match(FIRST_CHARS))) ? rest[0] : '';
        if (lm === null) lm = { index: pos };
        let parseResult = SiriGrammar.parse(left);
        console.log(parseResult)
        if (!parseResult.isValid && parseResult.pos === lm.index) {
            let keywords = parseResult.expecting.filter((element) =>
                element instanceof jsleri.Keyword &&
                element.keyword.indexOf(check) === 0).map((kw) => kw.keyword);
            keywords.sort();
            console.log(keywords);
            // l = keywords.length;
            // if (l == 1) {
            //     statement = keywords[0].substring(check.length);
            //     $inp.val(query.slice(0, pos) + statement + query.slice(pos));
            //     pos += statement.length;
            //     inp.selectionStart = pos;
            //     inp.selectionEnd = pos;
            //     app.insertSpace();
            // } else if (l > 1) {
            //     for (i=0; true; i++) {
            //         p = keywords[0][i];
            //         for (j=1; j < l; j++) {
            //             if (p !== keywords[j][i] || j > keywords[j].length ) {
            //                 j = 0;
            //                 break;
            //             }
            //         }
            //         if (j !== l) {
            //             break;
            //         }
            //     }
            //     statement = keywords[0].substring(0, i);
            //     $inp.val(query.slice(0, pos) + statement.slice(check.length) + query.slice(pos + rest.length));
            //     pos += (statement.length - check.length);
            //     inp.selectionStart = pos;
            //     inp.selectionEnd = pos;
            //     autoCompletionIndex = -1;
            //     autoCompletionLength = l;
            //     $('#autocomplete-popup').css('left', Math.min(14 + (pos*7), $inp.width())).show().children('ul').html(function (stmts, l, pos) {
            //         var s = '';
            //         for (var i=0; i < l; i++) {
            //             s +=
            //                 '<li data-index="' + i + '" onclick="app.insertText(\'' + keywords[i].substring(pos)  + '\', 0)">' +
            //                     '<span class="grey">' + keywords[i].substring(0, pos) + '</span>' +
            //                     keywords[i].substring(pos) +
            //                 '</li>';
            //         }
            //         return s;
            //     }(keywords, l, i)).children('li').hover(function () {
            //         $('#autocomplete-popup ul').children('li').removeClass('selected-auto-complete');
            //         autoCompletionIndex = $(this).addClass('selected-auto-complete').data('index');
            //     });
            // }
        }
    }

    onInpChange(event) {
        this.setState({ query: event.target.value });
    }

    onQuery() {
        QueryActions.query(this.state.query);
    }

    render() {
        let alert = (this.state.alert !== null) ? (
            <div className={`alert alert-${this.state.alert.severity}`}>{this.state.alert.message}</div>
        ) : null;

        return (
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
                        <AutoCompletePopup />
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
        )
    }
}

export default Auth;