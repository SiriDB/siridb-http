import QueryActions from '../Actions/QueryActions.jsx';
import AuthActions from '../Actions/AuthActions.jsx';
import BaseStore from './BaseStore.jsx';

const unexpected_msg = 'Oops, some unexpected error has occurred. Please check the console for more details.';

class QueryStore extends BaseStore {

    constructor() {
        super(QueryActions);
        this.state = {
            alert: null,
            result: null,
            sending: false
        };
    }

    onQuery(query) {
        this.setState({ sending: true, result: null });
        this.post('/query', { query: query }).always(() => {
            this.setState({ sending: false });
        }).done((data) => {
            this.setState({ result: data });
        }).fail((error, msg) => {
            if (error.status === 422) {
                AuthActions.logoff();
            } else {
                this.setState({
                    alert: {
                        severity: (msg) ? 'warning' : 'error',
                        message: msg || unexpected_msg
                    }
                });
            }
        });
    }

    onClearAlert() {
        this.setState({ alert: null });
    }

    onClearAll() {
        this.setState({
            alert: null,
            result: null,
            sending: false
        });
    }
}

export default QueryStore;