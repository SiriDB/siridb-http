import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';

import AuthActions from '../../Actions/AuthActions';


class TopMenu extends React.Component {

    static propTypes = {
        onLogoClick: PropTypes.func.isRequired,
        showLogoff: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            isIn: false
        };
    }

    handleToggleClick = () => {
        /* eslint-disable react/no-set-state */
        this.setState((prevState) => ({
            isIn: !prevState.isIn
        }));
    }

    handleItemClick = () => {
        /* eslint-disable react/no-set-state */
        this.setState({
            isIn: false
        });
    }

    handleLogoff = () => {
        AuthActions.logoff();
    }

    render() {
        const {onLogoClick, showLogoff} = this.props;
        let logoff = showLogoff ? (
            <li>
                <a onClick={this.handleLogoff} >
                    {'Logoff'}
                </a>
            </li>
        ) : null;

        const {isIn} = this.state;

        let navclass = isIn ? ' in' : '';

        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <a
                            className="navbar-brand"
                            data-keyboard="true"
                            onClick={onLogoClick}
                        >
                            <img
                                alt="SiriDB Logo"
                                src="/img/siridb-small.png"
                            />
                        </a>
                        <button
                            className="navbar-toggle collapsed"
                            onClick={this.handleToggleClick}
                            type="button"
                        >
                            <span className="sr-only">
                                {'Toggle navigation'}
                            </span>
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                        </button>
                    </div>

                    <div className={`collapse navbar-collapse${navclass}`}>
                        <ul
                            className="nav navbar-nav navbar-right"
                            onClick={this.handleItemClick}
                        >
                            <li>
                                <NavLink
                                    exact
                                    to="/"
                                >
                                    {'Query'}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/insert" >
                                    {'Insert'}
                                </NavLink>
                            </li>
                            {logoff}
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

export default TopMenu;