import React from 'react';
import Reflux from 'reflux-edge';

Reflux.defineReact(React, Reflux);

import { render } from 'react-dom';
import App from './App/App.jsx';
import { hashHistory, Router, Route, IndexRoute } from 'react-router';
import Query from './Query/Query.jsx';

render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Query} />
        </Route>
    </Router>
), document.getElementById("app"));

