import React from 'react';
import Select from 'react-select';
import {ErrorMessage, runAlert} from '..';
import {useAsync, useSyncedRef} from '../../hooks';
import {deleteAlert, editAlert, saveAlert} from '../api';
import {CDCFilterCreator} from '../creator';
import {IAlert, IUploadAlert, IReactSelectOption, ICDCConfiguration} from '../interfaces';
import {CDCDataChangeTable} from './CDCDataChangeTable';

interface ICDCEditAlert {
  alertData: IUploadAlert;
  setAlertData: (formData: IUploadAlert) => void;
  onAlertChanged: (id?: number) => void;
  selectedAlert?: IAlert;
  creationMode: boolean;
  setCreationMode: (mode: boolean) => void;
  cdcConfig: {[cdcId: string]: ICDCConfiguration};
}

export function CDCAlertView({alertData, setAlertData, onAlertChanged, selectedAlert, setCreationMode, creationMode, cdcConfig}: ICDCEditAlert) {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [deleteMode, setDeleteMode] = React.useState<boolean>(false);
  const [validFilter, setValidFilter] = React.useState<boolean>(true);
  const [validName, setValidName] = React.useState<boolean>(true);
  const [validCompareColumns, setValidCompareColumns] = React.useState<boolean>(true);

  const alertDataRef = useSyncedRef(alertData);

  const {status: deleteStatus, error: deleteError, execute: doDelete} = useAsync(async () => {
    setEditMode(false);
    await deleteAlert(selectedAlert.id);
    onAlertChanged();
  }, false);

  const {status: saveStatus, error: saveError, execute: doSave} = useAsync(async () => {
    const valFilter = alertData?.filter?.children.length > 0;
    const valName = alertData?.name?.trim().length > 0;
    const valCompareColumns = alertData?.compare_columns?.length > 0;
    if (valFilter && valName && valCompareColumns) {
      let newAlert;
      if (selectedAlert) {
        newAlert = await editAlert(selectedAlert.id, {...alertData})
          .then((alert) => {
            return runAlert(alert.id).then((a) => {
              return a ? a : alert;
            });
          });
        setEditMode(false);
      } else {
        newAlert = await saveAlert({...alertData})
          .then((alert) => {
            return runAlert(alert.id).then((a) => {
              return a ? a : alert;
            });
          });
        setCreationMode(false);
      }
      onAlertChanged(newAlert.id);
    }
    setValidFilter(valFilter);
    setValidName(valName);
    setValidCompareColumns(valCompareColumns);
  }, false);

  // TODO: CDCs are more complex than just filters, i.e. they also have fields.
  const cdcs = Object.keys(cdcConfig);

  const filterSelection = cdcConfig[alertData?.cdc_id]?.filters;
  const compareColumns = cdcConfig[alertData?.cdc_id]?.compareColumns;
  const filterComponents = cdcConfig[alertData?.cdc_id]?.components;

  React.useEffect(() => {
    if (selectedAlert) {
      setEditMode(false);
      setDeleteMode(false);
    }
  }, [selectedAlert]);


  const onDiscard = () => {
    setEditMode(false);
    setAlertData(selectedAlert);
  };

  const editButton = saveStatus === 'pending' || deleteStatus === 'pending' ? (
    <i className="fas fa-spinner fa-spin" />
  ) : !editMode && !deleteMode && !creationMode ? (<>
    <button title="Edit Alert" className="btn btn-text-secondary" onClick={() => setEditMode(true)}><i className="fas fa-pencil-alt"></i></button>
    <button title="Delete Alert" className="btn btn-text-secondary" onClick={() => setDeleteMode(true)}><i className="fas fa-trash"></i></button>
  </>) : (editMode || creationMode ? <>
    <button title="Save changes" className="btn btn-text-secondary" onClick={() => doSave()}><i className="fas fa-save"></i></button>
    <button title="Discard changes" className="btn btn-text-secondary ms-1" onClick={editMode ? () => onDiscard() : () => setCreationMode(false)}><i className="fas fa-times"></i></button>
  </> : <>
    <button title="Delete" className="btn btn-text-secondary" onClick={() => doDelete()}><i className="fas fa-check"></i></button>
    <button title="No Delete" className="btn btn-text-secondary ms-1" onClick={() => setDeleteMode(false)}><i className="fas fa-times"></i></button>
  </>);

  return (<>
    <div className="d-md-flex justify-content-md-end">
      <small>{editButton}</small>
    </div>
    {selectedAlert?.latest_error ?
      <ErrorMessage error={new Error(`In the sync from ${new Date(selectedAlert.latest_error_date)} an error occured: ${selectedAlert.latest_error}`)} />
      : deleteError ?
        <ErrorMessage error={new Error(`While deleting an error occured: ${deleteError}`)} />
        : saveError ?
          <ErrorMessage error={new Error(`While saving an error occured: ${saveError}`)} />
          : null
    }
    <div className="accordion" id="editAlert">
      {!editMode && !creationMode ?
        <div key="one" className="accordion-item">
          <h2 className="accordion-header" id="heading-one">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-one" aria-expanded="true" aria-controls="collapse-one">
              {`${selectedAlert.latest_diff ? 'Latest revision from: ' + new Date(selectedAlert.latest_compare_date)?.toLocaleDateString() : 'No new data'}`}
            </button>
          </h2>
          <div id="collapse-one" className="accordion-collapse collapse show" aria-labelledby="heading-one" data-bs-parent="#editAlert">
            <CDCDataChangeTable selectedAlert={selectedAlert} onAlertChanged={onAlertChanged} />
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
                onChange={(e) => setAlertData({...alertData, cdc_id: e.value, compare_columns: null})}
              />
            </div>
            <div className="mb-3 col pe-2">
              <label className="form-label">Change Fields</label>
              <Select<IReactSelectOption, true>
                isMulti
                className={`${validCompareColumns ? '' : 'form-control is-invalid'}`}
                isDisabled={!creationMode && !editMode}
                closeMenuOnSelect={false}
                options={compareColumns?.map((c) => ({label: c, value: c}))}
                //check for compare_columns because otherwise it would not reset the selection after the cdc_id was changed
                value={alertData.compare_columns ? alertData.compare_columns.map((c) => ({label: c, value: c})) : null}
                onChange={(e) => setAlertData({...alertData, compare_columns: e.map((col) => col.value)})}
              />
              {validCompareColumns ? null :
                <div className="invalid-feedback">
                  Change fields must not be empty!
                </div>
              }
            </div>
            <div className="mb-3 col">
              <label className="form-label">Email notification</label>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" disabled={!creationMode && !editMode} checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
                <label className="form-check-label ms-2">Send me an email</label>
              </div>
            </div>
          </div>
          <div>
            {filterSelection && alertData?.filter ?
              <CDCFilterCreator filterSelection={!creationMode && !editMode ? null : filterSelection} filterComponents={filterComponents} filter={alertData.filter} setFilter={(v) => {
                console.log("TEST123", alertData);
                const current = alertDataRef.current;
                setAlertData({...current, filter: v(current.filter)});
              }} isInvalid={!validFilter} />
              :
              <p>No filters available for this cdc</p>}
          </div>
        </div>
      </div>
    </div>
  </>);
}