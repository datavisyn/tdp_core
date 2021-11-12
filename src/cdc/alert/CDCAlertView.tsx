import React from 'react';
import Select from 'react-select';
import {runAlert} from '..';
import {deleteAlert, editAlert, saveAlert} from '../api';
import {CDCFilterCreator} from '../creator';
import {IAlert, IFilter, IFilterComponent, IUploadAlert, IReactSelectOption} from '../interfaces';
import {CDCDataChangeTable} from './CDCDataChangeTable';

interface ICDCEditAlert {
  alertData: IUploadAlert;
  setAlertData: (formData: IUploadAlert) => void;
  filterSelection?: IFilter<any>[];
  filter: IFilter;
  setFilter: (filter: IFilter) => void;
  filterComponents: {[key: string]: {component: IFilterComponent<any>, config?: any}};
  onAlertChanged: (id?: number) => void;
  selectedAlert?: IAlert;
  cdcs: string[];
  compareColumnOptions: string[];
  creationMode: boolean;
  setCreationMode: (mode: boolean) => void;
}

export function CDCAlertView({alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs, compareColumnOptions, setCreationMode, creationMode}: ICDCEditAlert) {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [deleteMode, setDeleteMode] = React.useState<boolean>(false);
  const validFilter = filter?.children.length > 0;
  const validName = alertData?.name?.trim().length > 0;

  React.useEffect(() => {
    setEditMode(false);
    setDeleteMode(false);
  }, [selectedAlert]);

  const onCreateSave = async () => {
    if (validFilter && validName) {
      const newAlert = await saveAlert({...alertData, filter})
        .then((alert) => {
          return runAlert(alert.id).then((a) => {
            return a ? a : alert;
          });
        });
      onAlertChanged(newAlert.id);
      setCreationMode(false);
    }
  };

  const onEditSave = async () => {
    if (validFilter && validName) {
      const newAlert = await editAlert(selectedAlert.id, {...alertData, filter})
        .then((alert) => {
          return runAlert(alert.id).then((a) => {
            return a ? a : alert;
          });
        });
      onAlertChanged(newAlert.id);
      setEditMode(false);
    }
  };

  const onDiscard = () => {
    setEditMode(false);
    setAlertData(selectedAlert);
    setFilter(selectedAlert.filter);
  };

  const onDelete = async (id: number) => {
    setEditMode(false);
    await deleteAlert(id);
    onAlertChanged();
  };

  const editButton = !editMode && !deleteMode && !creationMode ? (<>
    <button title="Edit Alert" className="btn btn-text-secondary" onClick={() => setEditMode(true)}><i className="fas fa-pencil-alt"></i></button>
    <button title="Delete Alert" className="btn btn-text-secondary" onClick={() => setDeleteMode(true)}><i className="fas fa-trash"></i></button>
  </>) : (editMode || creationMode ? <>
    <button title="Save changes" className="btn btn-text-secondary" onClick={editMode ? () => onEditSave() : () => onCreateSave()}><i className="fas fa-save"></i></button>
    <button title="Discard changes" className="btn btn-text-secondary ms-1" onClick={editMode ? () => onDiscard() : () => setCreationMode(false)}><i className="fas fa-times"></i></button>
  </> : <>
    <button title="Delete" className="btn btn-text-secondary" onClick={() => onDelete(selectedAlert.id)}><i className="fas fa-check"></i></button>
    <button title="No Delete" className="btn btn-text-secondary ms-1" onClick={() => setDeleteMode(false)}><i className="fas fa-times"></i></button>
  </>);

  return (<>
    <div className="d-flex w-100 justify-content-between mb-1">
      <h5>Your options</h5>
      <small>{editButton}</small>
    </div>
    <div className="accordion" id="editAlert">
      {!editMode && !creationMode ?
        <div key="one" className="accordion-item">
          <h2 className="accordion-header" id="heading-one">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-one" aria-expanded="true" aria-controls="collapse-one">
              {`${selectedAlert.latest_diff ? 'Latest revision from: ' + new Date(selectedAlert.latest_compare_date)?.toLocaleDateString() : 'No new data'}`}
            </button>
          </h2>
          <div id="collapse-one" className="accordion-collapse collapse show" aria-labelledby="heading-one" data-bs-parent="#editAlert">
            <CDCDataChangeTable selectedAlert={selectedAlert} onAlertChanged={onAlertChanged}/>
          </div>
        </div>
        : null}
      <div key="two" className="accordion-item">
        <h2 className="accordion-header" id="heading-two">
          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-two" aria-expanded="true" aria-controls="collapse-two">
            Alert overview
          </button>
        </h2>
        <div id="collapse-two" className={`p-4 accordion-collapse collapse${editMode || creationMode ? ' show' : ''}`} aria-labelledby="heading-two" data-bs-parent="#editAlert">
          <div className="row mb-3">
            <div className="mb-3 col">
              <label className="form-label">Name</label>
              {!creationMode && !editMode ?
                <h6>{alertData.name}</h6>
                :
                <><input type="text" className={`form-control${validName ? '' : ' is-invalid'}`} value={alertData.name} onChange={(e) => setAlertData({...alertData, name: e.target.value})} required />
                  {validName ? null :
                    <div className="invalid-feedback">
                      Name must not be empty!
                    </div>}</>
              }
            </div>
            <div className="mb-3 col pe-2">
              <label className="form-label">CDC</label>
              <Select<IReactSelectOption>
                isDisabled={!creationMode && !editMode}
                options={cdcs.map((c) => ({label: c, value: c}))}
                value={{label: alertData.cdc_id, value: alertData.cdc_id}}
                onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
              />
            </div>
            <div className="mb-3 col pe-2">
              <label className="form-label">Change Fields</label>
              <Select<IReactSelectOption, true>
                isMulti
                isDisabled={!creationMode && !editMode}
                closeMenuOnSelect={false}
                options={compareColumnOptions.map((c) => ({label: c, value: c}))}
                value={alertData.compare_columns?.map((c) => ({label: c, value: c}))}
                onChange={(e) => setAlertData({...alertData, compare_columns: e.map((col) => col.value)})}
              />
            </div>
            <div className="mb-3 col">
              <label className="form-label">Email notification</label>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" disabled={true} checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
                <label className="form-check-label ms-2">Send me an email</label>
              </div>
            </div>
          </div>
          <div>
            {filterSelection || !filter ?
              <CDCFilterCreator filterSelection={!creationMode && !editMode ? null : filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} isInvalid={!validFilter} />
              :
              <p>No filters available for this cdc</p>}
          </div>
        </div>
      </div>
    </div>
  </>);
}
