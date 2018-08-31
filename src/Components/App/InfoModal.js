import React from 'react';
import PropTypes from 'prop-types';
import {withVlow} from 'vlow';
import DatabaseStore from '../../Stores/DatabaseStore';


const InfoModal = ({onHide, show, dbname, version, httpServer}) => (
    <Modal
        onHide={onHide}
        show={show}
    >
        <Modal.Header closeButton />
        <Modal.Body>
            <img
                alt="SiriDB Logo"
                src="/img/siridb-large.png"
            />
            <dl className="dl-horizontal">
                <dt>
                    {'Database:'}
                </dt>
                <dd>
                    {dbname}
                </dd>
                <dt>
                    {'SiriDB:'}
                </dt>
                <dd>
                    {version}
                </dd>
                <dt>
                    {'HTTP Server:'}
                </dt>
                <dd>
                    {httpServer}
                </dd>
            </dl>
        </Modal.Body>
    </Modal>
);

InfoModal.propTypes = {
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,

    /* DatabaseStore properties */
    dbname: PropTypes.string.isRequired,
    httpServer: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
};

export default withVlow(DatabaseStore, InfoModal);
