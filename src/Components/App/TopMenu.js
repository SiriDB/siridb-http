import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import {withStyles} from '@material-ui/core';
import {withRouter} from 'react-router-dom';
import AuthActions from '../../Actions/AuthActions';
import TabIndicatorProps from '../../Utils/TabIndicatorProps';


const styles = {
    flex: {
        flexGrow: 1,
    },
    toolbar: {
        minHeight: 48,
    },
};


class TopMenu extends React.Component {

    static propTypes = {
        onLogoClick: PropTypes.func.isRequired,
        showLogoff: PropTypes.bool.isRequired,
        history: PropTypes.objectOf(PropTypes.any).isRequired,
    };


    handleLogoff = () => {
        AuthActions.logoff();
    }

    handleNavChange = history => (_, value) => history.push(value)

    render() {
        const {classes, history, location} = this.props;

        return (
            <AppBar
                className={classes.flex}
                position="static"
            >
                <Toolbar className={classes.toolbar}>
                    <div className={classes.flex}>
                        <img
                            alt="SiriDB Logo"
                            src="/img/siridb-small.png"
                        />
                    </div>
                    <Tabs
                        TabIndicatorProps={TabIndicatorProps}
                        onChange={this.handleNavChange(history)}
                        value={location.pathname}
                    >
                        <Tab
                            label="Query"
                            value="/query"
                        />
                        <Tab
                            label="Insert"
                            value="/insert"
                        />
                    </Tabs>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withRouter(withStyles(styles)(TopMenu));