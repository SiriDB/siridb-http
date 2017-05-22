import React from 'react';
import BaseStore from './BaseStore.jsx';
import AuthActions from '../Actions/AuthActions.jsx';
import QueryActions from '../Actions/QueryActions.jsx';

class AuthStore extends BaseStore {

    constructor() {
        super();
        this.listenables = AuthActions;
        this.state = {
            user: null,
            authRequired: null,
            authError: null
        };
        AuthActions.fetch();
    }

    onSetAuthError(errorMsg) {
        this.setState({authError: errorMsg});
    }

    onClearAuthError() {
        this.setState({authError: null});
    }

    onFetch() {
        this.fetch('/auth/fetch')
        .done((data) => {
            this.setState(data);
        })
    }

    onLogoff() {
        localStorage.clear();
        QueryActions.clearAll();
        this.fetch('/auth/logout')
        .done((data) => {
            this.setState({user: null});
        })
    }

    onLogin(username, password) {
        if (!username) {
            AuthActions.setAuthError('Username is required');
        } else if (!password) {
            AuthActions.setAuthError('Password is required');
        } else {
            this.post('/auth/login', {username: username, password: password})
            .done((data) => {
                localStorage.clear();
                QueryActions.clearAll();
                this.setState(data);
            })
            .fail((error, msg) => {
                AuthActions.setAuthError(msg || 'Unknown error occurred');
            });
        }
    }
}

export default AuthStore;