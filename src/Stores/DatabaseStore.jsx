import React from 'react';
import DatabaseActions from '../Actions/DatabaseActions.jsx';
import BaseStore from './BaseStore.jsx';
import AppActions from '../Actions/AppActions.jsx';

class DatabaseStore extends BaseStore {

    constructor() {
        super();
        this.listenables = DatabaseActions;
        this.state = {
            version: false,
        };
    }

    onFetch() {
        this.fetch('/db-info')
        .done((data) => {
            this.setState({
                containers: data,
            });
        })
        .fail((error, data) => {
            AppActions.setError('Oops, an error occurred while loading database info...');
        });
    }

}

export default DatabaseStore;