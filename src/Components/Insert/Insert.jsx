import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import InsertStore from '../../Stores/InsertStore.jsx';
import DatabaseStore from '../../Stores/DatabaseStore.jsx';
import moment from 'moment';


class Insert extends Reflux.Component {

    constructor(props) {
        super(props);
        this.stores = [InsertStore, DatabaseStore];
        this.state = {
            data: ''
        }
    }

    _now() {
        return parseInt(moment().format('x') / this.factor);
    }

    componentDidMount() {
        /* Initialize factor */
        this.factor = {
            s: 1e3,
            ms: 1e0,
            us: 1e-3,
            ns: 1e-6
        }[this.state.timePrecision];

        /* Random value */
        let val = Math.floor((Math.random() * 100) + 1);

        /* Setup example */
        this.setState({
            data: `{\n\t"series-001": [\n\t\t[${this._now()}, ${val}]\n\t]\n}`
        });
    }

    onInpChange(event) {
        this.setState({
            data: event.target.value,
        });
    }

    render() {
        let hasError = false;
        try {
            JSON.parse(this.state.data || '{}');
        } catch (e) {
            hasError = true;
        }
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
                                onChange={this.onInpChange.bind(this)} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Insert;