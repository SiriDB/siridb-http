import PropTypes from 'prop-types';
import React from 'react';
import {withVlow} from 'vlow';
import moment from 'moment';

import InsertStore from '../../Stores/InsertStore';
import InsertActions from '../../Actions/InsertActions';
import DatabaseStore from '../../Stores/DatabaseStore';


const SELECT_ALL = -1;
const withStores = withVlow([InsertStore, DatabaseStore]);

class Insert extends React.Component {

    static propTypes = {
        /* DatabaseStore properties */
        factor: PropTypes.number.isRequired,

        /* InsertStore properties */
        alert: PropTypes.shape({
            severity: PropTypes.oneOf(['success', 'warning', 'error']),
            message: PropTypes.string,
        }),
        sending: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        alert: null,
    }

    constructor(props) {
        super(props);

        // set initial value, this.state.factor is required
        const val = Math.floor((Math.random() * 100) + 1);

        this.state = {
            data: `{\n\t"series-001": [\n\t\t[${this._now()}, ${val}]\n\t]\n}`
        };

        // set inital cursor pos
        this.cursorPos = null;
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

    _now() {
        const {factor} = this.props;
        return Math.floor(moment().format('x') / factor);
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
        const {data} = this.state;
        this.cursorPos = SELECT_ALL;
        InsertActions.insert(data);
    }

    handleClearAlert = InsertActions.clearAlert;

    mapRef = (el) => {
        this.inp = el;
    }

    render() {
        const {alert, sending} = this.props;
        const {data} = this.state;
        let hasError = false;
        try {
            JSON.parse(data || '{}');
        } catch (e) {
            hasError = true;
        }
        const alertComp = (alert !== null) ? (
            <div className="alert-wrapper">
                <div className={`alert alert-${alert.severity}`}>
                    <a
                        className="close"
                        onClick={this.handleClearAlert}
                    >
                        {'×'}
                    </a>
                    {alert.message}
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
                                value={data}
                            />
                        </div>
                        <div className="input-group input-group-sm">
                            <button
                                className="btn btn-default"
                                disabled={hasError || sending}
                                onClick={this.handleInsert}
                                type="button"
                            >
                                <i className="fa fa-fw fa-paper-plane" />
                                {'send'}
                            </button>
                        </div>
                    </div>
                    {alertComp}
                </div>
            </div>
        );
    }
}

export default withStores(Insert);