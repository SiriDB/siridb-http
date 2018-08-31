import BaseStore from './BaseStore';
import AuthActions from '../Actions/AuthActions';
import QueryActions from '../Actions/QueryActions';

class AuthStore extends BaseStore {

    constructor() {
        super(AuthActions);
        this.state = {
            user: null,
            authRequired: null,
        };
        AuthActions.fetch();
    }

    onFetch() {
        this.fetch('/auth/fetch').done((data) => {
            this.setState(data);
        });
    }

    onLogoff() {
        localStorage.clear();
        QueryActions.clearAll();
        this.fetch('/auth/logout').done(() => {
            this.setState({user: null});
        });
    }

    onLogin(credentials, onError) {
        this.post('/auth/login', credentials).done((data) => {
            localStorage.clear();
            QueryActions.clearAll();
            this.setState(data);
        }).fail((_, msg) => {console.log(msg); onError(msg || 'Unknown error occurred');});
    }
}

export default AuthStore;