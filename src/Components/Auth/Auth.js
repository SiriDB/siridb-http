import PropTypes from 'prop-types';
import React from 'react';
import {withVlow} from 'vlow';

import AuthActions from '../../Actions/AuthActions';
import AuthStore from '../../Stores/AuthStore';


const withStores = withVlow(AuthStore);


class Auth extends React.Component {

    static propTypes = {
        /* AuthStore properties */
        authError: PropTypes.string,
    }

    static defaultProps = {
        authError: null,
    }

    state = {
        username: '',
        password: ''
    };

    handleLogin = () => {
        const {username, password} = this.state;
        AuthActions.login(username, password);
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
        const {authError} = this.props;
        const {username, password} = this.state;
        let error = (authError !== null) ? (
            <div className="alert-wrapper">
                <div className="alert alert-warning">
                    {authError}
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
                                    value={username}
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
                                    value={password}
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

export default withStores(Auth);