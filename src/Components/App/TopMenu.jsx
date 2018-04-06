import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import AuthActions from '../../Actions/AuthActions.jsx';

class TopMenu extends React.Component {

    static propTypes = {
        onLogoClick: PropTypes.func.isRequired,
        showLogoff: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            in: false
        };
    }

    onToggleClick() {
        this.setState({
            in: !this.state.in
        });
    }

    onItemClick() {
        this.setState({
            in: false
        });
    }

    render() {
        let logoff = (this.props.showLogoff) ?
            <li>
                <a onClick={AuthActions.logoff} >Logoff</a>
            </li> : null;

        let navclass = (this.state.in) ? ' in' : '';

        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <a className="navbar-brand" data-keyboard="true" onClick={this.props.onLogoClick}>
                            <img src="/img/siridb-small.png" alt="SiriDB Logo" />
                        </a>
                        <button type="button" className="navbar-toggle collapsed" onClick={this.onToggleClick.bind(this)}>
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                    </div>

                    <div className={`collapse navbar-collapse${navclass}`}>
                        <ul className="nav navbar-nav navbar-right" onClick={this.onItemClick.bind(this)}>
                            <li><Link to="/" >Query</Link></li>
                            <li><Link to="/insert" >Insert</Link></li>
                            {logoff}
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default TopMenu;