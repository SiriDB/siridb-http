import React from 'react';
import QueryActions from '../Actions/QueryActions.jsx';
import BaseStore from './BaseStore.jsx';


const unexpected_msg = 'Oops, some unexpected error has occurred. Please check the console for more details.';

class DatabaseStore extends BaseStore {

    constructor() {
        super();
        this.listenables = QueryActions;
        this.state = {
            alert: null,
            result: null,
            sending: false
        };
    }

    onQuery(query) {
        this.setState({ sending: true });
        this.post('/query', { query: query })
            .always((xhr, data) => {
                this.setState({ sending: false });
            })
            .done((data) => {
                this.setState({ result: data });
            })
            .fail((error, data) => {
                this.setState({
                    alert: {
                        severity: (data.error_msg) ? 'warning' : 'error',
                        message: data.error_msg || unexpected_msg
                    }
                });
            });
    }

    onClearAlert() {
        this.setState({ alert: null });
    }
}

export default DatabaseStore;