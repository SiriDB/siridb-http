import PropTypes from 'prop-types';
import React from 'react';
import {withVlow} from 'vlow';
import {Route, Switch} from 'react-router-dom';
import {Redirect} from 'react-router';

import AppStore from '../../Stores/AppStore';
import AuthStore from '../../Stores/AuthStore';
import DatabaseStore from '../../Stores/DatabaseStore';
import InfoDialog from './InfoDialog';
import Insert from '../Insert/Insert';
import PageDoesNotExist from './PageDoesNotExist';
import Query from '../Query/Query';
import TopMenu from './TopMenu';


class App extends React.Component {

    static propTypes = {
        appError: PropTypes.string,
        authRequired: PropTypes.bool,
        user: PropTypes.string,
    }

    static defaultProps = {
        appError: null,
        authRequired: null,
        user: null,
    }

    state = {
        openInfoDialog: false
    };

    handleOpenInfoDialog = () => { this.setState({ openInfoDialog: true }); }

    handleCloseInfoDialog = () => { this.setState({ openInfoDialog: false }); }

    render() {
        const {appError, user, authRequired} = this.props;
        const {openInfoDialog} = this.state;

        return (appError !== null) ?
            <div>
                {appError}
            </div>
            : (user !== null) ?
                <div>
                    <TopMenu
                        onLogoClick={this.handleOpenInfoDialog}
                        showLogoff={authRequired}
                    />
                    <InfoDialog
                        onClose={this.handleCloseInfoDialog}
                        open={openInfoDialog}
                    />
                    {/* <Switch>
                        <Route
                            component={Query}
                            exact
                            path="/"
                        />
                        <Route
                            component={Insert}
                            path="/insert"
                        />
                        <Route
                            component={PageDoesNotExist}
                            path="*"
                        />
                    </Switch> */}
                </div>
                : (authRequired === true) ? <Redirect to='/login' /> : null;
    }
}

export default withVlow([AppStore, DatabaseStore, AuthStore], App);