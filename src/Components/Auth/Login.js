import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import {withVlow} from 'vlow';
import {Redirect} from 'react-router';
import {Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import AuthActions from '../../Actions/AuthActions';
import AuthStore from '../../Stores/AuthStore';



const styles = () => ({
    root: {
        flexGrow: 1,
    },
    form: {
        maxWidth: 400
    },
    textField: {
        width: '100%',
        paddingBottom: 15,
    },
    paper: {
        paddingTop: 25,
        paddingBottom: 25,
        paddingLeft: 15,
        paddingRight: 15,
        margin: 10
    },
    button: {
        marginTop: 10,
        width: '100%',
    },
    logo: {
        marginTop: 20,
    }
});


class Login extends React.Component {

    static propTypes = {
        /* Styles properties */
        classes: PropTypes.objectOf(PropTypes.any).isRequired,

        /* AuthStore properties */
        user: PropTypes.string,
        authRequired: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        user: null,
    }

    state = {
        username: '',
        password: '',
        error: {
            msg: null,
            username: false,
            password: false,
        }
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleLogin();
        }
    }

    handleInpChange = key => ({target}) => this.setState(prevState => ({
        [key]: target.value,
        error: Object.assign({}, prevState.error, {msg: null, [key]: false})
    }))

    handleLogin = () => {
        const {username, password} = this.state;
        if (!username || !password) {
            this.setState({error: {
                msg: null,
                username: Boolean(!username),
                password: Boolean(!password),
            }});
        } else {
            AuthActions.login({username, password}, (errMsg) => this.setState(prevState => ({
                error: Object.assign({}, prevState.error, {msg: errMsg})
            })));
        }
    }

    render() {
        const {user, authRequired} = this.props;
        const {username, password, error} = this.state;
        const {classes} = this.props;

        return (user !== null || authRequired === false) ? <Redirect to='/' /> : (
            <Grid
                alignItems="center"
                className={classes.root}
                container
                direction="row"
                justify="center"
            >
                <Grid
                    className={classes.form}
                    item
                    xs={12}
                >
                    <Paper
                        className={classes.paper}
                        onKeyPress={this.handleKeyPress}
                    >
                        <Collapse in={Boolean(error.msg)}>
                            <Typography
                                color="error"
                                gutterBottom
                            >
                                {error.msg}
                            </Typography>
                        </Collapse>
                        <TextField
                            className={classes.textField}
                            error={error.name}
                            label="Name"
                            onChange={this.handleInpChange('username')}
                            value={username}
                        />
                        <TextField
                            className={classes.textField}
                            error={error.password}
                            label="Password"
                            onChange={this.handleInpChange('password')}
                            type="password"
                            value={password}
                        />
                        <Button
                            className={classes.button}
                            color="primary"
                            onClick={this.handleLogin}
                            variant="contained"
                        >
                            {'Login'}
                        </Button>
                    </Paper>
                    <div style={{textAlign: 'center'}}>
                        <img
                            alt="SiriDB Logo"
                            className={classes.logo}
                            height={85}
                            src="/img/siridb-large.png"
                            width={350}
                        />
                    </div>
                </Grid>
            </Grid>
        );
    }
}

export default withVlow(AuthStore, withStyles(styles)(Login));