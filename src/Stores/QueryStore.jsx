import React from 'react';
import DatabaseActions from '../Actions/DatabaseActions.jsx';
import BaseStore from './BaseStore.jsx';
import AppActions from '../Actions/AppActions.jsx';

class DatabaseStore extends BaseStore {

    constructor() {
        super();
        this.listenables = DatabaseActions;
        this.state = {
            alert: null,
            result: null
        };
    }

    onQuery() {
        this.fetch('/query')
        .done((data) => {
            this.setState(data);
        })
        .fail((error, data) => {
            AppActions.setError('Oops, an error occurred while loading database info...');
        });
    }

}

export default DatabaseStore;