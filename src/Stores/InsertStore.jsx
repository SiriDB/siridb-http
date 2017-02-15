import React from 'react';
import InsertActions from '../Actions/InsertActions.jsx';
import AuthActions from '../Actions/AuthActions.jsx';
import BaseStore from './BaseStore.jsx';


const unexpected_msg = 'Oops, some unexpected error has occurred. Please check the console for more details.';

class InsertStore extends BaseStore {

    constructor() {
        super();
        this.listenables = InsertActions;
        this.state = {
            alert: null,
            sending: false
        };
    }

    onInsert(data) {
        this.setState({ sending: true, alert: null });
        this.post('/insert', data)
            .always((xhr, data) => {
                this.setState({ sending: false });
            })
            .done((data) => {
                this.setState({
                    alert: {
                        severity: 'success',
                        message: data.success_msg || 'message unavailable'
                    }
                });
            })
            .fail((error, data) => {
                if (error.status === 422) {
                    AuthActions.logoff();
                } else {
                    this.setState({
                        alert: {
                            severity: (data.error_msg) ? 'warning' : 'error',
                            message: data.error_msg || unexpected_msg
                        }
                    });
                }
            });
    }

    onClearAlert() {
        this.setState({alert: null});
    }
}

export default InsertStore;