import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import localstorage from 'react-localstorage';
import QueryStore from '../../Stores/QueryStore.jsx';
import QueryActions from '../../Actions/QueryActions.jsx';


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
    }

    onKeyDown(event) {
        console.log(event.key);
        if (event.key == 'Tab') {
            event.preventDefault();
        }
    }

    onInpChange(event) {
        this.setState({query: event.target.value});
    }

    onQuery() {
        console.log(this.state.query);
    }

    render() {
        let alert = (this.state.alert !== null) ? (
            <div className={`alert alert-${alert.severity})`}>{this.state.alert.message}</div>
        ) : null;

        return (
            <div className="form">
                <div className="form-group">
                    <div className="input-group input-group-sm">
                        <input
                            autoFocus
                            type="text"
                            className="form-control"
                            placeholder="your query..."
                            value={this.state.query}
                            onKeyPress={this.onKeyPress.bind(this)}
                            onKeyDown={this.onKeyDown.bind(this)}
                            onChange={this.onInpChange.bind(this)} />
                        <span className="input-group-btn">
                            <button
                                className="btn btn-default"
                                type="button"
                                onClick={this.onQuery.bind(this)}>
                                <i className="fa fa-play"></i>
                            </button>
                        </span>
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