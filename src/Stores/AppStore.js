import Vlow from 'vlow';
import AppActions from '../Actions/AppActions';


class AppStore extends Vlow.Store {

    constructor() {
        super(AppActions);
        this.state = {
            appError: null
        };
    }

    onSetAppError(errorMsg) {
        this.setState({appError: errorMsg});
    }
}

export default AppStore;