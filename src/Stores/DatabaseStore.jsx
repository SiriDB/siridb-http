import React from 'react';
import DatabaseActions from '../Actions/DatabaseActions.jsx';
import BaseStore from './BaseStore.jsx';
import AppActions from '../Actions/AppActions.jsx';

class DatabaseStore extends BaseStore {

    constructor() {
        super();
        this.listenables = DatabaseActions;
        this.state = {
            version: null,
            dbname: null,
            timePrecision: null,
            factor: null,
            utcFormat: null
        };
        DatabaseActions.fetch();
    }

    onFetch() {
        this.fetch('/db-info')
        .done((data) => {
            data.factor = {
                s: 1e3,
                ms: 1e0,
                us: 1e-3,
                ns: 1e-6
            }[data.timePrecision];
            data.utcFormat = d3.utcFormat("%Y-%m-%d %H:%M:%SZ");
            this.setState(data);
        })
        .fail((error, data) => {
            AppActions.setError('Oops, an error occurred while loading database info...');
        });
    }

}

export default DatabaseStore;