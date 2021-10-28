import React from 'react';
import Select from 'react-select';
import {accordionItem, runAlert} from '.';
import {confirmAlertById, deleteAlert, editAlert} from './api';
import {CDCFilterComponent} from './CDCFilterComponent';
import {getTreeQuery, IAlert, IFilter, IFilterComponent, IUploadAlert} from './interface';

interface ICDCEditAlert {
  alertData: IUploadAlert;
  setAlertData: (formData: IUploadAlert) => void;
  filterSelection: IFilter<any>[] | undefined;
  filter: IFilter;
  setFilter: (filter: IFilter) => void;
  filterComponents: {[key: string]: IFilterComponent<any>};
  onAlertChanged: (id?: number) => void;
  selectedAlert: IAlert;
  cdcs: string[];
}

export function CDCEditAlert({alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs}: ICDCEditAlert) {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [deleteMode, setDeleteMode] = React.useState<boolean>(false);
  React.useEffect(() => {
    setEditMode(false);
    setDeleteMode(false);
  }, [selectedAlert]);

  const confirmChanges = async (id: number) => {
    const alert = await confirmAlertById(id);
    onAlertChanged(alert.id);
  };
  
  const onSave = async () => {
    setEditMode(false);
    const newAlert = await editAlert(selectedAlert.id, {...alertData, filter_dump: JSON.stringify(filter), filter_query: getTreeQuery(filter, filterComponents)});
    runAlert(newAlert.id);
    onAlertChanged(newAlert.id);
  };
  
  const onDiscard = () => {
    setEditMode(false);
    setAlertData(selectedAlert);
    setFilter(JSON.parse(selectedAlert.filter_dump));
  };
  
  const onDelete = async (id: number) => {
    setEditMode(false);
    await deleteAlert(id);
    onAlertChanged();
  };

  const generalInformation =
    (<>
      <div className="mb-3">
        <label className="form-label">Name</label>
        {!editMode ?
          <p>{alertData.name}</p>
          :
          <input type="text" className="form-control" value={alertData.name} onChange={(e) => setAlertData({...alertData, name: e.target.value})} />
        }
      </div>
      <div className="mb-3">
        <label className="form-label">CDC</label>
        <Select
          isDisabled={!editMode}
          options={cdcs.map((c) => {return {label: c, value: c};})}
          value={{label: alertData.cdc_id, value: alertData.cdc_id}}
          onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
        />
      </div>
      <input className="form-check-input" type="checkbox" disabled={!editMode} checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
      <label className="form-check-label ms-2">Email notification</label>
      <div className="mb-3 form-check"></div>
    </>);

  const literature = () => {
    const data = JSON.parse(selectedAlert.latest_diff)?.dictionary_item_added;
    return (<>{data?.length > 0 ? (<>
      <h6>Literature:</h6>
      {data.map((d, i) => <p key={i}>{d}</p>)}
      <button title="Confirm changes" className="btn btn-text-secondary" onClick={() => confirmChanges(selectedAlert.id)}>Confirm Changes</button>
    </>) : (
      <p>No new data available</p>
    )}
    </>);
  };

  const editButton = !editMode && !deleteMode ? (<>
    <button title="Edit Alert" className="btn btn-text-secondary" onClick={() => setEditMode(true)}><i className="fas fa-pencil-alt"></i></button>
    <button title="Delete Alert" className="btn btn-text-secondary" onClick={() => setDeleteMode(true)}><i className="fas fa-trash"></i></button>
  </>) : (editMode ? <>
    <button title="Save changes" className="btn btn-text-secondary" onClick={() => onSave()}><i className="fas fa-save"></i></button>
    <button title="Discard changes" className="btn btn-text-secondary ms-1" onClick={() => onDiscard()}><i className="fas fa-times"></i></button>
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
      {!editMode ? accordionItem(1, `${JSON.parse(selectedAlert.latest_diff)?.dictionary_item_added ? 'Latest revision from: ' + selectedAlert.latest_compare_date : 'No new data'}`, 'editAlert', literature(), true) : null}
      {accordionItem(2, 'Alert overview', 'editAlert', generalInformation, editMode)}
      {accordionItem(3, 'Filter settings', 'editAlert', filterSelection ? (!filter ? null : <CDCFilterComponent filterSelection={!editMode ? null : filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} disableFilter={!editMode} />) : <p>No filters available for this cdc</p>)}
    </div>
  </>);
}
