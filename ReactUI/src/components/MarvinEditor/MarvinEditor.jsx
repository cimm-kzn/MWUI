import React from 'react';
import { Button } from 'react-bootstrap';
import { MARVIN_PATH_IFRAME, MARVIN_EDITOR_IS_EMPTY } from '../../config';
import { exportCmlBase64, clearMarvin, importCml } from '../../core/marvinJsApi/marvinAPI';
import '../../css/Modal.css';

export const MarvinEditor = ({
  modal,
  closeModal,
  addStruct,
  editStruct,
}) => {
  const submitModal = (id) => {
    exportCmlBase64(
      (cmlBase64) => {
        if (cmlBase64.cml === MARVIN_EDITOR_IS_EMPTY) return false;
        if (id >= 0) {
          editStruct(id, cmlBase64);
        } else {
          addStruct(cmlBase64);
        }
        closeModal();
      },
    );
  };

  if (modal.visible) {
    if (modal.id >= 0) { importCml(modal.cml); } else { clearMarvin(); }
  }

  return (
    <div id={modal.visible ? '' : 'modal-hidden'} className="modal fade in" role="dialog">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              onClick={closeModal}
            >
                                &times;
            </button>
          </div>
          <div className="modal-body">
            <iframe
              title="marvinjs"
              id="marvinjs"
              data-toolbars="reaction"
              src={MARVIN_PATH_IFRAME}
            />
          </div>
          <div className="modal-footer">
            <Button onClick={() => { submitModal(modal.id); }}>Save</Button>
            <Button onClick={closeModal}>Discard</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
