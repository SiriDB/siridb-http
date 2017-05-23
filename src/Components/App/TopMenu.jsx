import React from 'react';
import { render } from 'react-dom';
import { Link, IndexLink } from 'react-router';
import AuthActions from '../../Actions/AuthActions.jsx';

class TopMenu extends React.Component {

    static propTypes = {
        onLogoClick: React.PropTypes.func.isRequired,
        showLogoff: React.PropTypes.bool.isRequired
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
                <Link onClick={AuthActions.logoff} activeClassName="active">Logoff</Link>
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
                            <li><IndexLink to="/" activeClassName="active">Query</IndexLink></li>
                            <li><Link to="insert" activeClassName="active">Insert</Link></li>
                            {logoff}
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}

export default TopMenu;