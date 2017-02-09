import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import TopMenu from './TopMenu.jsx';
import AppStore from '../../Stores/AppStore.jsx';
import AuthStore from '../../Stores/AuthStore.jsx';
import DatabaseStore from '../../Stores/DatabaseStore.jsx';
import Auth from '../Auth/Auth.jsx';
import InfoModal from './InfoModal.jsx';

class App extends Reflux.Component {

    constructor(props) {
        super(props);
        this.state = {
            showInfoModal: false
        }
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
                    {this.props.children}
                </div>
                : (this.state.authRequired === true) ? <Auth /> : null
    }
}

export default App;