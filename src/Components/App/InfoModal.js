import React from 'react';
import PropTypes from 'prop-types';
import {withVlow} from 'vlow';
import DatabaseStore from '../../Stores/DatabaseStore';
import {Modal} from 'react-bootstrap';


const withStores = withVlow(DatabaseStore);


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
    dbname: PropTypes.string,
    httpServer: PropTypes.string,
    version: PropTypes.string,
};

InfoModal.defaultProps = {
    dbname: '',
    httpServer: '',
    version: '',
};

export default withStores(InfoModal);
