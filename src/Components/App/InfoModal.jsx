import React from 'react';
import PropTypes from 'prop-types';
import Vlow from 'vlow';
import DatabaseStore from '../../Stores/DatabaseStore.jsx';
import { Modal } from 'react-bootstrap';

class InfoModal extends Vlow.Component {

    static propTypes = {
        show: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.mapStore(DatabaseStore);
    }

    render() {

        return  (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <img src="/img/siridb-large.png" alt="SiriDB Logo" />
                    <dl className="dl-horizontal">
                        <dt>Database:</dt>
                        <dd>{this.state.dbname}</dd>
                        <dt>SiriDB:</dt>
                        <dd>{this.state.version}</dd>
                        <dt>HTTP Server:</dt>
                        <dd>{this.state.httpServer}</dd>
                    </dl>
                </Modal.Body>
            </Modal>
        );
    }
}

export default InfoModal;
