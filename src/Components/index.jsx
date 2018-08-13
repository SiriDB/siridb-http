import React from 'react';  // eslint-disable-line
import ReactDOM from 'react-dom';
import App from './App/App.jsx';
import {HashRouter as Router, Route} from 'react-router-dom';
import 'babel-polyfill';
/* fixes issues on ie */


ReactDOM.render(
    <Router>
        <Route path="/" component={App} />
    </Router>,
    document.getElementById('app')
);