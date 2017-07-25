import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import {connect} from 'react-redux';
import {triggerModal} from '../actions/modal';
import {addTask, editTask} from '../actions/tasks';
import {exportCmlBase64, importCml, clearMarvin} from '../functions/marvinAPI';
import {MARVIN_PATH_IFRAME} from '../config';
import '../css/Modal.css'

class EditorStructure extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.submitModal = this.submitModal.bind(this);
    }

    closeModal() {
        this.props.dispatch(triggerModal(false));
    }

    submitModal() {
        let id = this.props.modal.id;

        exportCmlBase64(
            (cmlBase64) => {
                if (cmlBase64.cml == '<cml><MDocument></MDocument></cml>') return false;

                if (id >= 0)
                    this.props.dispatch(editTask(id, cmlBase64));
                else
                    this.props.dispatch(addTask(cmlBase64));
                this.closeModal();
            }
        );
    }

    render() {
        let ttt = this.props.modal.visible ? '' : 'hidden';
        let id = this.props.modal.id;
        if (this.props.modal.visible) {
            if (id >= 0)
                importCml(this.props.modal.cml);
            else
                clearMarvin();
        }

        return (
            <div className={ttt}>
                <div className="modal fade in" role="dialog">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={this.closeModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <iframe id="marvinjs" data-toolbars="reaction" src={MARVIN_PATH_IFRAME}></iframe>
                            </div>
                            <div className="modal-footer">
                                <Button onClick={this.submitModal}>Save</Button>
                                <Button onClick={this.closeModal}>Discard</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({modal: state.triggerModal});

export default connect(mapStateToProps)(EditorStructure);
