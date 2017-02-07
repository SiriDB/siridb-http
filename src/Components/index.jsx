import React from 'react';
import Reflux from 'reflux-edge';

Reflux.defineReact(React, Reflux);

import { render } from 'react-dom';
import App from './App/App.jsx';
import { hashHistory, Router, Route } from 'react-router'

render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
        </Route>
    </Router>
), document.getElementById("app"));

