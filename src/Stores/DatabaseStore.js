import React from 'react';  // eslint-disable-line
import DatabaseActions from '../Actions/DatabaseActions';
import BaseStore from './BaseStore';
import AppActions from '../Actions/AppActions';
import * as d3 from 'd3';


class DatabaseStore extends BaseStore {

    constructor() {
        super(DatabaseActions);
        this.state = {
            version: null,
            dbname: null,
            timePrecision: null,
            factor: 1e0,
            utcFormat: null
        };
        DatabaseActions.fetch();
    }

    onFetch() {
        this.fetch('/db-info').done((data) => {
            data.factor = {
                s: 1e3,
                ms: 1e0,
                us: 1e-3,
                ns: 1e-6
            }[data.timePrecision];
            data.utcFormat = d3.utcFormat('%Y-%m-%d %H:%M:%SZ');
            document.title = data.dbname;
            this.setState(data);
        }).fail(() => {
            AppActions.setError('Oops, an error occurred while loading database info...');
        });
    }
}

export default DatabaseStore;