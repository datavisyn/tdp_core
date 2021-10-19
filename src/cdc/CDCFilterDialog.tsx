import * as React from 'react';
import ReactDOM from 'react-dom';
import {BSModal, useAsync} from '../hooks';
import { getFilterFromTree, getTreeQuery, IAlert, IFilter, IFilterComponent } from "./interface";
import {getAlerts} from './api';
import {CDCEditAlert} from './CDCEditAlert';
import {CDCCreateAlert} from './CDCCreateAlert';

export function CDCFilterDialog() {
  const [selectedAlert, setSelectedAlert] = React.useState<IAlert>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [creationMode, setCreationMode] = React.useState<boolean>(false);

  const {status: alertStatus, error: alertError, execute: alertExecute, value: alerts} = useAsync(getAlerts, true);
  console.log(alerts);

  //filter settings reusable // alert overview / edit alert

  return <>
      <a style={{color: 'white', cursor: 'pointer'}} onClick={() => setShowDialog(true)}><i className="fas fa-filter" style={{marginRight: 4}}></i> Alert Filter</a>
      <BSModal show={showDialog} setShow={setShowDialog}>
        <div className="modal fade" tabIndex={-1}>
          <div className="modal-dialog" style={{maxWidth: '90%'}}>
            <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Alerts</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-4 overflow-auto">
                  <div className="d-flex w-100 justify-content-between">
                    <h5>Your alerts</h5>
                    <small><button className="btn btn-secondary" onClick={() => {setCreationMode(true); setSelectedAlert(null)}}>+</button></small>
                  </div>
                  {alertStatus === 'pending' ? <>Loading...</> : null}
                  {alertStatus === 'error' ? <>Error {alertError.toString()}</> : null}
                  {alertStatus === 'success' ? <div className="list-group">{alerts.map((alert, i) => 
                    <><a href="#" className={`list-group-item list-group-item-action${selectedAlert === alert ? " border-primary": ""}`} key={i} onClick={() => {setSelectedAlert(alert); setCreationMode(false)}} aria-current="true">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{alert.name} <small className="text-muted">for {alert.cdc_id}</small> </h6>
                        <small><span className="badge bg-primary rounded-pill">1</span></small>
                      </div>
                      <p className="mb-1">Some placeholder content in a paragraph.</p>
                      <small>last confirmed: {alert.confirmation_date}</small>
                    </a></>
                  )}</div> : null}
                </div>
                <div className="col-8 overflow-auto">
                  {creationMode ? (
                    <CDCCreateAlert />
                  ) : (
                    selectedAlert ? <CDCEditAlert selectedAlert={selectedAlert}/> : null
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
            </div>
          </div>
        </div>
      </BSModal>
  </>;
}

export class CDCFilterDialogClass {
  private node: HTMLElement;

  constructor(parent: HTMLElement) {
    this.node = document.createElement('div');
    parent.appendChild(this.node);
    this.init();
  }

  private init() {
    ReactDOM.render(
      <CDCFilterDialog />,
      this.node
    );
  }
}
