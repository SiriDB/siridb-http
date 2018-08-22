import React from 'react';
import Vlow from 'vlow';
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


class App extends Vlow.Component {

    constructor(props) {
        super(props);
        this.state = {
            showInfoModal: false
        };
        this.mapStores([AppStore, DatabaseStore, AuthStore]);
    }

    handleShowInfoModal = () => {
        this.setState({ showInfoModal: true });
    }

    handleHideInfoModal = () => {
        this.setState({ showInfoModal: false });
    }

    render() {

        return (this.state.appError !== null) ?
            <div>
                {this.state.appError}
            </div>
            : (this.state.user !== null) ?
                <div className="container">
                    <TopMenu
                        onLogoClick={this.handleShowInfoModal}
                        showLogoff={this.state.authRequired}
                    />
                    <InfoModal
                        onHide={this.handleHideInfoModal}
                        show={this.state.showInfoModal}
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
                : (this.state.authRequired === true) ? <Auth /> : null;
    }
}

export default App;