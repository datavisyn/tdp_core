import * as React from 'react';
import {BSModal, useBSModal, BSTooltip} from '../hooks';

export function CDCFilterDialog({show, setShow}: {show: boolean; setShow: (show: boolean) => void;}) {
    return <div>
        <button type="button" data-toggle="modal" data-target="#myModal">Launch modal</button>
        <BSModal show={show} setShow={setShow}>
            <div className="modal fade" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Modal title</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <BSTooltip title="Hello"><p>Modal body text goes here.</p></BSTooltip>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary">Save changes</button>
                    </div>
                    </div>
                </div>
            </div>
        </BSModal>
    </div>
}