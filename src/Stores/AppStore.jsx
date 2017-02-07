import React from 'react';
import Reflux from 'reflux-edge';
import AppActions from '../Actions/AppActions.jsx';

Reflux.defineReact(React, Reflux);

class AppStore extends Reflux.Store {

    constructor() {
        super();
        this.listenables = AppActions;
        this.state = {
            appError: null
        };
    }

    onSetAppError(errorMsg) {
        this.setState({appError: errorMsg});
    }
}

export default AppStore;