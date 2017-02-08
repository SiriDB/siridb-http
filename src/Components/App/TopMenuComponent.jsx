import React from 'react';
import { render } from 'react-dom';
import { Link } from 'react-router';
import AuthActions from '../../Actions/AuthActions.jsx';

class TopMenuComponent extends React.Component {

    static propTypes = {
        onLogoClick: React.PropTypes.func.isRequired,
        showLogoff: React.PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);
    }

    render() {
        let logoff = (this.props.showLogoff) ?
            <li>
                <Link onClick={AuthActions.logoff} activeClassName="active">Logoff</Link>
            </li> : null;

        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <a className="navbar-brand" data-keyboard="true" onClick={this.props.onLogoClick}>
                            <img src="/static/img/siridb-small.png" alt="SiriDB Logo" />
                        </a>
                        <button type="button" className="navbar-toggle collapsed">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                            <span className="icon-bar"></span>
                        </button>
                    </div>

                    <div className="collapse navbar-collapse">
                        <ul className="nav navbar-nav navbar-right">
                            <li><Link to="/query" activeClassName="active">Query</Link></li>
                            <li><Link to="/insert" activeClassName="active">Insert</Link></li>
                            {logoff}
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}

export default TopMenuComponent;