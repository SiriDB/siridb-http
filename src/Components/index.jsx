import React from 'react';
import { render } from 'react-dom';
import App from './App/App.jsx';
import OverviewComponent from './Overview/Overview.jsx';
import Environments from './Overview/Environments.jsx';
import ManageComponent from './Manage/Manage.jsx';
import { hashHistory, Router, Route, IndexRoute } from 'react-router'

render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Environments} />
            <Route path="environments" component={Environments} />
            <Route path="container/:containerId" component={OverviewComponent} />
            <Route path="container/:containerId/manage/:activeTab" component={ManageComponent} />
            <Route path="*" component={Environments} />
        </Route>
    </Router>
), document.getElementById("app"));

