import React from 'react';
import PropTypes from 'prop-types';
import Vlow from 'vlow';
import DatabaseStore from '../../Stores/DatabaseStore';
import { Modal } from 'react-bootstrap';

class InfoModal extends Vlow.Component {

    static propTypes = {
        onHide: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.mapStore(DatabaseStore);
    }

    render() {
        const {onHide} = this.props;
        return  (
            <Modal
                onHide={onHide}
                show={this.props.show}
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
                            {this.state.dbname}
                        </dd>
                        <dt>
                            {'SiriDB:'}
                        </dt>
                        <dd>
                            {this.state.version}
                        </dd>
                        <dt>
                            {'HTTP Server:'}
                        </dt>
                        <dd>
                            {this.state.httpServer}
                        </dd>
                    </dl>
                </Modal.Body>
            </Modal>
        );
    }
}

export default InfoModal;
