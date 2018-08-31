

import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';  // ie and old browser compatibility
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import App from './App/App';
import Login from './Auth/Login';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';


const theme = createMuiTheme({
    // in case we want to overwrite the default theme
    palette: {
        error: red,
        primary: {
            main: '#668290',
        },
        background: {
            default: '#32444d',
            paper: '#e4e8ea'
        }
    }
});


ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
            <Switch>
                <Route
                    component={App}
                    exact
                    path="/"
                />
                <Route
                    component={Login}
                    path='/login'
                />
            </Switch>
        </Router>
    </MuiThemeProvider>,
    document.getElementById('app')
);
