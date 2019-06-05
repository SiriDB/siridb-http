import PropTypes from 'prop-types';
import React from 'react';
import {withVlow} from 'vlow';
import {Route, Switch} from 'react-router-dom';

import AppStore from '../../Stores/AppStore';
import Auth from '../Auth/Auth';
import AuthStore from '../../Stores/AuthStore';
import DatabaseStore from '../../Stores/DatabaseStore';
import InfoModal from './InfoModal';
import Insert from '../Insert/Insert';
import PageDoesNotExist from './PageDoesNotExist';
import Query from '../Query/Query';
import TopMenu from './TopMenu';


const withStores = withVlow([AppStore, DatabaseStore, AuthStore]);


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

    constructor(props) {
        super(props);

        this.state = {
            showInfoModal: false
        };
    }

    handleShowInfoModal = () => {
        this.setState({ showInfoModal: true });
    }

    handleHideInfoModal = () => {
        this.setState({ showInfoModal: false });
    }

    render() {
        const {appError, user, authRequired} = this.props;
        const {showInfoModal} = this.state;

        return (appError !== null) ?
            <div>
                {appError}
            </div>
            : (user !== null) ?
                <div className="container">
                    <TopMenu
                        onLogoClick={this.handleShowInfoModal}
                        showLogoff={authRequired}
                    />
                    <InfoModal
                        onHide={this.handleHideInfoModal}
                        show={showInfoModal}
                    />
                    <Switch>
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
                    </Switch>
                </div>
                : (authRequired === true) ? <Auth /> : null;
    }
}

export default withStores(App);