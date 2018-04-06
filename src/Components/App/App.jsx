import React from 'react';  // eslint-disable-line
import Reflux from 'reflux-edge';
import {Route, Switch} from 'react-router-dom';
import TopMenu from './TopMenu.jsx';
import AppStore from '../../Stores/AppStore.jsx';
import AuthStore from '../../Stores/AuthStore.jsx';
import DatabaseStore from '../../Stores/DatabaseStore.jsx';
import Auth from '../Auth/Auth.jsx';
import InfoModal from './InfoModal.jsx';
import Query from '../Query/Query.jsx';
import Insert from '../Insert/Insert.jsx';


class App extends Reflux.Component {

    constructor(props) {
        super(props);
        this.state = {
            showInfoModal: false
        };
        this.stores = [AppStore, DatabaseStore, AuthStore];
    }

    onShowInfoModal() {
        this.setState({ showInfoModal: true });
    }

    onHideInfoModal() {
        this.setState({ showInfoModal: false });
    }

    render() {

        return (this.state.appError !== null) ?
            <div>{this.state.appError}</div>
            : (this.state.user !== null) ?
                <div className="container">
                    <TopMenu
                        onLogoClick={this.onShowInfoModal.bind(this)}
                        showLogoff={this.state.authRequired} />
                    <InfoModal
                        show={this.state.showInfoModal}
                        onHide={this.onHideInfoModal.bind(this)} />
                    <Switch>
                        <Route exact path="/" component={Query} />
                        <Route path="/insert" component={Insert} />
                        <Route path="*" component={() => <div>Page does not exist</div>} />
                    </Switch>
                </div>
                : (this.state.authRequired === true) ? <Auth /> : null;
    }
}

export default App;