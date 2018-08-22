import React from 'react';
import Vlow from 'vlow';

import AuthActions from '../../Actions/AuthActions';
import AuthStore from '../../Stores/AuthStore';


class Auth extends Vlow.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
        this.mapStore(AuthStore);
    }

    handleLogin = () => {
        AuthActions.login(this.state.username, this.state.password);
    }

    handleUsernameChange = (event) => {
        AuthActions.clearAuthError();
        this.setState({
            username: event.target.value
        });
    }

    handlePasswordChange = (event) => {
        AuthActions.clearAuthError();
        this.setState({
            password: event.target.value
        });
    }

    handleKeyPress = (event) => {
        if (event.key == 'Enter') {
            this.handleLogin();
        }
    }

    render() {
        let error = (this.state.authError !== null) ? (
            <div className="alert-wrapper">
                <div className="alert alert-warning">
                    {this.state.authError}
                </div>
            </div>
        ) : null;

        return (
            <div className="container container-start">
                <div className="row logo">
                    <img
                        alt="SiriDB Logo"
                        src="/img/siridb-large.png"
                    />
                </div>
                <div className="row">
                    <div className="form">
                        <div className="form-group">
                            <div className="input-group input-group-sm">
                                <input
                                    autoFocus
                                    className="form-control"
                                    onChange={this.handleUsernameChange}
                                    onKeyPress={this.handleKeyPress}
                                    placeholder="your username..."
                                    type="text"
                                    value={this.state.username}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group input-group-sm">
                                <input
                                    className="form-control"
                                    onChange={this.handlePasswordChange}
                                    onKeyPress={this.handleKeyPress}
                                    placeholder="your password..."
                                    type="password"
                                    value={this.state.password}
                                />
                                <span className="input-group-btn">
                                    <button
                                        className="btn btn-default"
                                        onClick={this.handleLogin}
                                        type="button"
                                    >
                                        <i className="fa fa-sign-in" />
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