import React from 'react';  // eslint-disable-line
import Reflux from 'reflux-edge';
import AuthStore from '../../Stores/AuthStore.jsx';
import AuthActions from '../../Actions/AuthActions.jsx';


class Auth extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = AuthStore;
        this.state = {
            username: '',
            password: ''
        };
    }

    onLogin() {
        AuthActions.login(this.state.username, this.state.password);
    }

    onUsernameChange(event) {
        AuthActions.clearAuthError();
        this.setState({
            username: event.target.value
        });
    }

    onPasswordChange(event) {
        AuthActions.clearAuthError();
        this.setState({
            password: event.target.value
        });
    }

    onKeyPress(event) {
        if (event.key == 'Enter') {
            this.onLogin();
        }
    }

    render() {
        let error = (this.state.authError !== null) ? (
            <div className="alert-wrapper">
                <div className="alert alert-warning">{this.state.authError}</div>
            </div>
        ) : null;

        return (
            <div className="container container-start">
                <div className="row logo">
                    <img src="/img/siridb-large.png" alt="SiriDB Logo" />
                </div>
                <div className="row">
                    <div className="form">
                        <div className="form-group">
                            <div className="input-group input-group-sm">
                                <input
                                    autoFocus
                                    type="text"
                                    className="form-control"
                                    placeholder="your username..."
                                    value={this.state.username}
                                    onKeyPress={this.onKeyPress.bind(this)}
                                    onChange={this.onUsernameChange.bind(this)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group input-group-sm">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="your password..."
                                    value={this.state.password}
                                    onKeyPress={this.onKeyPress.bind(this)}
                                    onChange={this.onPasswordChange.bind(this)} />
                                <span className="input-group-btn">
                                    <button
                                        className="btn btn-default"
                                        type="button"
                                        onClick={this.onLogin.bind(this)}>
                                        <i className="fa fa-sign-in"></i>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                    {error}
                </div>
            </div>
        );
    }
}

export default Auth;