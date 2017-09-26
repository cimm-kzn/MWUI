import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const WrapperDropzove = styled(Dropzone)`
  width: 100%;
  height: 400px;
  border: 2px dotted #808080;
  text-align: center;
  font-size: 26px;
`;

const DropZoneText = styled.span`
    vertical-align: middle;
    display: block;
`;

const DropZoneImage = styled.img`
  vertical-align: middle;
  display: inline-block;
`;

const WrapperContent = styled.div`
  display: inline-block;
  text-align: center;
`;

class ModalUploadFileView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
    };
  }


  onSubmit(data) {
    var body = new FormData();
    Object.keys(data).forEach(( key ) => {
      body.append(key, data[ key ]);
    });

    console.log(body);

    if (this.state.file) {
      this.props.uploadFile(this.state.file);
    }
  }

  onDrop(accepted, rejected) {
    console.log(accepted)
    if (accepted.length) this.setState({ file: accepted[0] });
  }
  render() {
    return (
      <Modal show={this.props.isShow} onHide={this.props.closeModal} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Upload file</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.onSubmit.bind(this)}>
        <Modal.Body>

          <WrapperDropzove
            onDrop={this.onDrop.bind(this)}
            // accept="text/rdf, text/sdf, text/mrv, text/smiles"
          >
            <WrapperContent>
              <DropZoneImage src="/static/img/upload-file.png" />
              <DropZoneText>Try dropping some files here, </DropZoneText>
              <DropZoneText>or click to select files to upload.</DropZoneText>
              <DropZoneText>Only *.rdf, *.sdf, *.smiles and *.mrv files will be accepted</DropZoneText>
              <div>{this.state.file.name}</div>
            </WrapperContent>
          </WrapperDropzove>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Upload file</Button>
          <Button onClick={this.props.closeModal}>Close</Button>
        </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

ModalUploadFileView.propTypes = {
  isShow: PropTypes.bool,
  closeModal: PropTypes.func,
  uploadFile: PropTypes.func,
};

ModalUploadFileView.defaultProps = {
  isShow: false,
};

export default ModalUploadFileView;

