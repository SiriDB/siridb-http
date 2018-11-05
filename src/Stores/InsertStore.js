import InsertActions from '../Actions/InsertActions';
import AuthActions from '../Actions/AuthActions';
import BaseStore from './BaseStore';


const unexpected_msg = 'Oops, some unexpected error has occurred. Please check the console for more details.';

class InsertStore extends BaseStore {

    state = {
        alert: null,
        sending: false
    };

    constructor() {
        super(InsertActions);
    }

    onInsert(data) {
        this.setState({ sending: true, alert: null });
        this.postraw('/insert', data).always(() => {
            this.setState({ sending: false });
        }).done((data) => {
            this.setState({
                alert: {
                    severity: 'success',
                    message: data.success_msg || 'message unavailable'
                }
            });
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
        this.setState({alert: null});
    }
}

export default InsertStore;