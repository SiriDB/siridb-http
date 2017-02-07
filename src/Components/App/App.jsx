import React from 'react';
import Reflux from 'reflux-edge';
import { render } from 'react-dom';
import TopMenuComponent from './TopMenuComponent.jsx';
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
        this.setState({showInfoModal: true});
    }

    onHideInfoModal() {
        this.setState({showInfoModal: false});
    }

    render() {

        return  (this.state.appError !== null) ? (
            <div>{this.state.error}</div>
        ) : (this.state.user) ? (
            <div className="container">
                <TopMenuComponent onLogoClick={this.onShowInfoModal.bind(this)} />
                <InfoModal show={this.state.showInfoModal} onHide={this.onHideInfoModal.bind(this)} />
                <div className="container">
                    {this.props.children}
                </div>
            </div>
        ) : (
            <Auth />
        )
    }
}

export default App;