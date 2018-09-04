import React from 'react';
import PropTypes from 'prop-types';
import { withVlow } from 'vlow';
import DatabaseStore from '../../Stores/DatabaseStore';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Typography, withStyles } from '@material-ui/core';

const styles = {
    logo: {
        margin: 0
    }
};

const InfoDialog = ({onClose, open, dbname, httpServer, version, classes}) => (
    <Dialog
        aria-labelledby="siridb-info-dialog-title"
        onClose={onClose}
        open={open}
    >
        <DialogTitle id="siridb-info-dialog-title">
            <img
                alt="SiriDB Logo"
                className={classes.logo}
                height={85}
                src="/img/siridb-large.png"
                width={350}
            />
        </DialogTitle>
        <Typography
            gutterBotton
            variant="subheading"
        >
            {`SiriDB HTTP version ${httpServer}`}
        </Typography>
        <Typography gutterBottom>
            {`Logged on to database \`${dbname}\` running on SiriDB version ${version})`}
        </Typography>
    </Dialog>
);

InfoDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,

    /* DatabaseStore properties */
    dbname: PropTypes.string.isRequired,
    httpServer: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,

    /* Styles properties */
    classes: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withVlow(DatabaseStore, withStyles(styles)(InfoDialog));
