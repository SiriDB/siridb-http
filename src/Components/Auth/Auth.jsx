import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import AuthStore from '../../Stores/AuthStore.jsx';
import AuthActions from '../../Actions/AuthActions.jsx';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


class Auth extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = AuthStore;
        this.state = {
            secret: '',
        };
    }

    onLoginSecret() {
        console.log(this.state.secret);
        AuthActions.loginSecret(this.state.secret);
    }

    onSecretChange(event) {
        if (this.state.authError !== null) {
            AuthActions.clearAuthError();
        }
        this.setState({
            secret: event.target.value
        });
    }

    render() {
        let error = (this.state.authError !== null) ? (
            <div className="alert alert-warning">{this.state.authError}</div>
        ) : null;

        return (
            <div className="container">
                <div className="row">
                    <img id="logo" src="/static/img/siridb-medium.png" alt="SiriDB Logo" />
                </div>
                <div className="row">
                    <div className="form">
                        <div className="form-group">
                            <div className="input-group input-group-sm">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Authenticate using secret"
                                    value={this.state.secret}
                                    onChange={this.onSecretChange.bind(this)} />
                                <span className="input-group-btn">
                                    <button className="btn btn-default" type="button" onClick={this.onLoginSecret.bind(this)}>
                                        <i className="fa fa-sign-in"></i>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                    <ReactCSSTransitionGroup
                            component="div"
                            className=""
                            transitionName="alert-animation"
                            transitionEnterTimeout={300}
                            transitionLeaveTimeout={500}>
                        {error}
                    </ReactCSSTransitionGroup>
                </div>
            </div>
        )
    }
}

export default Auth;