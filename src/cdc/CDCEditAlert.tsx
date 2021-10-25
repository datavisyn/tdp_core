import React from "react";
import Select from 'react-select';
import {accordionItem} from ".";
import {editAlert} from "./api";
import {CDCFilterComponent} from "./CDCFilterComponent";
import {getTreeQuery, IAlert, IFilter, IFilterComponent, IUploadAlert} from "./interface";

interface ICDCEditAlert {
  alertData: IUploadAlert;
  setAlertData: (formData: IUploadAlert) => void;
  filterSelection: IFilter<any>[] | undefined;
  filter: IFilter;
  setFilter: (filter: IFilter) => void;
  filterComponents: {[key: string]: IFilterComponent<any>};
  alertList: IAlert[];
  setAlertList: (alerts: IAlert[]) => void;
  selectedAlert: IAlert;
  setSelctedAlert: (alert: IAlert) => void;
  cdcs: string[];
}

export function CDCEditAlert({alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, alertList, setAlertList, selectedAlert, setSelctedAlert, cdcs}: ICDCEditAlert) {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  React.useEffect(() => {
    setEditMode(false);
  }, [selectedAlert]);

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
          options={cdcs.map(c => {return {label: c, value: c}})}
          value={{label: alertData.cdc_id, value: alertData.cdc_id}}
          onChange={e => setAlertData({...alertData, cdc_id: e.value})}
        />
      </div>
      <input className="form-check-input" type="checkbox" disabled={!editMode} checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
      <label className="form-check-label ms-2">Email notification</label>
      <div className="mb-3 form-check"></div>
    </>);

  const literature = () => {
    const data = JSON.parse(selectedAlert.latest_diff)?.dictionary_item_added;
    return (<>{data?.length > 0 ? (<>
      <h6>New literature from:</h6>
      <p>{selectedAlert.latest_compare_date}</p>
      <h6>Literature:</h6>
      {data.map((d, i) => <p key={i}>{d}</p>)}
    </>) : (
      <p>No new literature available</p>
    )}
    </>);
  };

  const onSave = async () => {
    const newAlert = await editAlert(selectedAlert.id, {...alertData, filter_dump: JSON.stringify(filter), filter_query: getTreeQuery(filter, filterComponents)});
    setAlertList([newAlert, ...alertList.filter((alert) => alert.id !== selectedAlert.id)]);
    setSelctedAlert(newAlert);
    setEditMode(false);
  };

  const onDiscard = () => {
    setAlertData(selectedAlert);
    setFilter(JSON.parse(selectedAlert.filter_dump));
    setEditMode(false);
  };

  const editButton = !editMode ? (
    <button className="btn btn-text-secondary" onClick={() => setEditMode(true)}><i className="fas fa-pencil-alt"></i></button>
  ) : (<>
    <button title="Save changes" className="btn btn-text-secondary" onClick={() => onSave()}><i className="fas fa-save"></i></button>
    <button title="Discard changes" className="btn btn-text-secondary ms-1" onClick={() => onDiscard()}><i className="fas fa-ban"></i></button>
  </>);

  return (<>
    <div className="d-flex w-100 justify-content-between mb-1">
      <h5>Your options</h5>
      <small>{editButton}</small>
    </div>
    <div className="accordion" id="createAlert">
      {accordionItem(1, 'New literature', 'createAlert', literature(), true)}
      {accordionItem(2, 'Alert overview', 'createAlert', generalInformation)}
      {accordionItem(3, 'Filter settings', 'createAlert', filterSelection ? (!filter ? null : <CDCFilterComponent filterSelection={!editMode ? null : filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} disableFilter={!editMode} />) : <p>No filters available for this cdc</p>)}
    </div>
  </>);
}
