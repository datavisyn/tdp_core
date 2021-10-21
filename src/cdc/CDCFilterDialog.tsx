import * as React from 'react';
import ReactDOM from 'react-dom';
import {BSModal, useAsync} from '../hooks';
import {IAlert, IFilter, IFilterComponent} from "./interface";
import {deleteAlert, getAlerts, saveAlert} from './api';
import {CDCCreateEditAlert} from './CDCCreateEditAlert';
import {CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter} from './CDCGroupingFilter';
import {v4 as uuidv4} from 'uuid';
import {CDCTextFilter, CDCTextFilterId, createCDCTextFilter} from './CDCTextFilter';
import {CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter} from './CDCCheckboxFilter';
import {CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter} from './CDCRangeFilter';

export interface ICDCFormData {
  name: string;
  cdc_id: string;
  enable_mail_notification: boolean;
}

const DEFAULTFORMDATA = {name: "", enable_mail_notification: false, cdc_id: ""};
const DEFAULTFILTER = {...createCDCGroupingFilter(uuidv4(), 'Drop filters here'), disableDragging: true, disableRemoving: true};

export function CDCFilterDialog({filterComponents, filtersByCDC}: {
  filterComponents: {[key: string]: IFilterComponent<any>};
  filtersByCDC: {[cdcId: string]: IFilter<any>[]}
}) {
  const [selectedAlert, setSelectedAlert] = React.useState<IAlert>();
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [creationMode, setCreationMode] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<IFilter>();
  const [formData, setFormData] = React.useState<ICDCFormData>();
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [alertList, setAlertList] = React.useState<IAlert[]>();

  React.useEffect(() => {
    setFormData(DEFAULTFORMDATA);
    setFilter(DEFAULTFILTER);
  }, []);

  React.useEffect(() => {
    console.log(selectedAlert)
    setEditMode(false);
    if (selectedAlert) {
      setFormData(selectedAlert);
      if (selectedAlert.filter) {
        try {
          setFilter(JSON.parse(selectedAlert.filter));
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [selectedAlert]);

  const {status: alertStatus, error: alertError, execute: alertExecute, value: alerts} = useAsync(getAlerts, true);
  React.useEffect(() => {
    setAlertList(alerts);
  }, [alerts]);

  const onSave = () => {
    //TODO: put group away again
    saveAlert({...formData, filter: JSON.stringify(filter)});
  };

  const editButton = !creationMode ? (
    !editMode && selectedAlert ? (
      <button className="btn btn-secondary" onClick={() => setEditMode(true)}><i className="fas fa-pencil-alt"></i></button>
    ) : (<>
      <button title="Save changes" className="btn btn-secondary" onClick={() => setEditMode(false)}><i className="fas fa-save"></i></button>
      <button title="Discard changes" className="btn btn-secondary ms-1" onClick={() => setEditMode(false)}><i className="fas fa-ban"></i></button>
    </>)
  ) : null;

  const onCreateButtonClick = () => {
    setCreationMode(true);
    setSelectedAlert(null);
    setFormData(DEFAULTFORMDATA);
    setFilter(DEFAULTFILTER);
  };

  const onDeleteButton = (id: number) => {
    setAlertList([...alertList.filter((alert) => alert.id !== id)]);
    deleteAlert(id);
  };

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
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h5>Your alerts</h5>
                    <small><button className="btn btn-secondary" onClick={() => onCreateButtonClick()}>+</button></small>
                  </div>
                  {alertStatus === 'pending' ? <>Loading...</> : null}
                  {alertStatus === 'error' ? <>Error {alertError.toString()}</> : null}
                  {alertStatus === 'success' ? <div className="list-group">{alertList.map((alert) =>
                    <div key={alert.id} ><a href="#" className={`list-group-item list-group-item-action${selectedAlert === alert ? " border-primary" : ""}`} onClick={() => {setSelectedAlert(alert); setCreationMode(false)}} aria-current="true">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{alert.name} <small className="text-muted">for {alert.cdc_id}</small> </h6>
                        <small><span className="badge bg-primary rounded-pill">1</span><span className="badge bg-secondary rounded-pill" onClick={() => onDeleteButton(alert.id)}><i className="fas fa-trash"></i></span></small>
                      </div>
                      <p className="mb-1">Some placeholder content in a paragraph.</p>
                      <small>last confirmed: {alert.confirmation_date}</small>
                    </a></div>
                  )}</div> : null}
                </div>
                <div className="col-8 overflow-auto">
                  {selectedAlert || creationMode ? <>
                    <div className="d-flex w-100 justify-content-between mb-1">
                      <h5>Your options</h5>
                      <small>{editButton}</small>
                    </div>
                    <CDCCreateEditAlert
                      editMode={selectedAlert ? editMode : null}
                      setEditMode={selectedAlert ? setEditMode : null}
                      filter={filter} setFilter={setFilter}
                      formData={formData} setFormData={setFormData}
                      filterSelection={filtersByCDC[selectedAlert.cdc_id]}
                      filterComponents={filterComponents}
                      selectedAlert={selectedAlert ? selectedAlert : null} />
                  </> : null}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" onClick={() => onSave()}>Save changes</button>
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
      <CDCFilterDialog
        filterComponents={{
          [CDCGroupingFilterId]: CDCGroupingFilter,
          [CDCCheckboxFilterId]: CDCCheckboxFilter,
          [CDCTextFilterId]: CDCTextFilter,
          [CDCRangeFilterId]: CDCRangeFilter
        }}
        filtersByCDC={{
          'demo': [
            createCDCGroupingFilter(uuidv4(), 'Grouping Filter'),
            createCDCTextFilter(uuidv4(), 'Text Filter', {filter: [{field: 'field1', value: []}], fields: [{field: 'field1', options: ['hallo', 'hier', 'steht', 'text']}, {field: 'field2', options: ['tschüss', 'hier', 'nicht']}, {field: 'field3', options: ['test', 'noch ein test', 'hi']}]}),
            createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', {fields: ['Eins', 'zwei', 'dRei'], filter: []}),
            createCDCRangeFilter(uuidv4(), 'Range Filter', {min: 1950, max: 2021}),
          ]
        }} />,
      this.node
    );
  }
}
