import React from 'react';
import Vlow from 'vlow';
import moment from 'moment';

import InsertStore from '../../Stores/InsertStore';
import InsertActions from '../../Actions/InsertActions';
import DatabaseStore from '../../Stores/DatabaseStore';


const SELECT_ALL = -1;


class Insert extends Vlow.Component {

    constructor(props) {
        super(props);
        this.mapStores([InsertStore, DatabaseStore]);

        // set initial value, this.state.factor is required
        let val = Math.floor((Math.random() * 100) + 1);
        this.state.data = `{\n\t"series-001": [\n\t\t[${this._now()}, ${val}]\n\t]\n}`;

        // set inital cursor pos
        this.cursorPos = null;
    }

    _now() {
        return Math.floor(moment().format('x') / this.state.factor);
    }

    handleInpChange = (event) => {
        InsertActions.clearAlert();
        this.setState({
            data: event.target.value,
        });
    }

    handleKeyDown = (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            this.setState((prevState) => ({
                data: prevState.data.slice(0, this.inp.selectionStart) + '\t' + prevState.data.slice(this.inp.selectionEnd)
            }));
            this.cursorPos = this.inp.selectionStart + 1;
        }
    }

    handleInsert = () => {
        this.cursorPos = SELECT_ALL;
        InsertActions.insert(this.state.data);
    }

    handleClearAlert = InsertActions.clearAlert;

    mapRef = (el) => {
        this.inp = el;
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
                    <a
                        className="close"
                        onClick={this.handleClearAlert}
                    >
                        {'×'}
                    </a>
                    {this.state.alert.message}
                </div>
            </div>
        ) : null;
        return (
            <div>
                <div className={`form form-insert ${hasError ? 'has-error' : ''}`}>
                    <div className="form-group">
                        <div className="input-group input-group-sm">
                            <textarea
                                className="form-control"
                                onChange={this.handleInpChange}
                                onKeyDown={this.handleKeyDown}
                                ref={this.mapRef}
                                spellCheck={false}
                                type="text"
                                value={this.state.data}
                            />
                        </div>
                        <div className="input-group input-group-sm">
                            <button
                                className="btn btn-default"
                                disabled={hasError || this.state.sending}
                                onClick={this.handleInsert}
                                type="button"
                            >
                                <i className="fa fa-fw fa-paper-plane" />
                                {'send'}
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