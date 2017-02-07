import React from 'react';
import BaseStore from './BaseStore.jsx';
import AuthActions from '../Actions/AuthActions.jsx';


class AuthStore extends BaseStore {

    constructor() {
        super();
        this.listenables = AuthActions;
        this.state = {
            user: null,
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
            this.setState({user: data['user']});
        })
    }

    onLogoff() {
        this.fetch('/auth/logoff')
        .done((data) => {
            this.setState({user: null});
        })
    }

    onLoginSecret(secret) {
        if (!secret) {
            AuthActions.setAuthError('Secret is required');
        } else {
            console.log(secret);
            this.post('/auth/secret', {secret: secret})
            .done((data) => {
                this.setState({user: data['user']});
            })
            .fail((error, data) => {
                AuthActions.setAuthError(data.error || 'Unknown error occurred');
            });
        }
    }


}

export default AuthStore;