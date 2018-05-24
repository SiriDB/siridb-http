import React from 'react';  // eslint-disable-line
import Reflux from 'reflux-edge';
import InsertStore from '../../Stores/InsertStore.jsx';
import InsertActions from '../../Actions/InsertActions.jsx';
import DatabaseStore from '../../Stores/DatabaseStore.jsx';
import moment from 'moment';


const SELECT_ALL = -1;


class Insert extends Reflux.Component {

    constructor(props) {
        super(props);
        this.stores = [InsertStore, DatabaseStore];
        this.state = {
            data: ''
        };
        this.cursorPos = null;
    }

    _now() {
        return Math.floor(moment().format('x') / this.state.factor);
    }

    componentDidMount() {
        /* Random value */
        let val = Math.floor((Math.random() * 100) + 1);

        /* Setup example */
        this.setState({
            data: `{\n\t"series-001": [\n\t\t[${this._now()}, ${val}]\n\t]\n}`
        });
    }

    onInpChange(event) {
        InsertActions.clearAlert();
        this.setState({
            data: event.target.value,
        });
    }

    onKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.setState({
                data: this.state.data.slice(0, this.refs.inp.selectionStart) + '\t' + this.state.data.slice(this.refs.inp.selectionEnd)
            });
            this.cursorPos = this.refs.inp.selectionStart + 1;
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

    onInsert() {
        this.cursorPos = SELECT_ALL;
        InsertActions.insert(this.state.data);
    }

    render() {
        let hasError = false;
        try {
            JSON.parse(this.state.data || '{}');
        } catch (e) {
            hasError = true;
        }
        let alert = (this.state.alert !== null) ? (
            <div className="alert-wrapper">
                <div className={`alert alert-${this.state.alert.severity}`}>
                    <a className="close" onClick={InsertActions.clearAlert}>×</a>{this.state.alert.message}
                </div>
            </div>
        ) : null;
        return (
            <div>
                <div className={`form form-insert ${hasError ? 'has-error' : ''}`}>
                    <div className="form-group">
                        <div className="input-group input-group-sm">
                            <textarea
                                ref="inp"
                                type="text"
                                className="form-control"
                                spellCheck={false}
                                value={this.state.data}
                                onKeyDown={this.onKeyDown.bind(this)}
                                onChange={this.onInpChange.bind(this)} />
                        </div>
                        <div className="input-group input-group-sm">
                            <button
                                type="button"
                                className="btn btn-default"
                                onClick={this.onInsert.bind(this)}
                                disabled={hasError || this.state.sending}>
                                <i className="fa fa-fw fa-paper-plane"></i> send
                            </button>
                        </div>
                    </div>
                    {alert}
                </div>
            </div>
        );
    }
}

export default Insert;