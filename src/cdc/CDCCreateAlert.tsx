import React from 'react';
import Select from 'react-select';
import {accordionItem} from '.';
import {saveAlert} from './api';
import {CDCFilterComponent} from './CDCFilterComponent';
import {getTreeQuery, IAlert, IFilter, IFilterComponent, IUploadAlert} from './interface';

interface ICDCCreateAlert {
  alertData: IUploadAlert;
  setAlertData: (formData: IUploadAlert) => void;
  filterSelection: IFilter<any>[] | undefined;
  filter: IFilter;
  setFilter: (filter: IFilter) => void;
  filterComponents: {[key: string]: IFilterComponent<any>};
  alertList: IAlert[];
  setAlertList: (alerts: IAlert[]) => void;
  setSelectedAlert: (alert: IAlert) => void;
  setCreationMode: (mode: boolean) => void;
  cdcs: string[];
}

export function CDCCreateAlert({alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, alertList, setAlertList, setCreationMode, setSelectedAlert, cdcs}: ICDCCreateAlert) {

  const generalInformation =
    (<>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input type="text" className="form-control" value={alertData.name} onChange={(e) => setAlertData({...alertData, name: e.target.value})} />
      </div>
      <div className="mb-3">
        <label className="form-label">CDC</label>
        <Select
          options={cdcs.map((c) => {return {label: c, value: c};})}
          value={{label: alertData.cdc_id, value: alertData.cdc_id}}
          onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
        />
      </div>
      <input className="form-check-input" type="checkbox" checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
      <label className="form-check-label ms-2">Email notification</label>
      <div className="mb-3 form-check"></div>
    </>);

  const onSave = async () => {
    const newAlert = await saveAlert({...alertData, filter_dump: JSON.stringify(filter), filter_query: getTreeQuery(filter, filterComponents)});
    setAlertList([newAlert, ...alertList]);
    setSelectedAlert(newAlert);
    setCreationMode(false);
  };

  return (<>
    <div className="d-flex w-100 justify-content-between mb-1">
      <h5>Create alert</h5>
      <small>
        <button title="Save changes" className="btn btn-text-secondary" onClick={() => onSave()}><i className="fas fa-save"></i></button>
        <button title="Discard changes" className="btn btn-text-secondary ms-1" onClick={() => setCreationMode(false)}><i className="fas fa-ban"></i></button>
      </small>
    </div>
    <div className="accordion" id="createAlert">
      {accordionItem(1, 'Alert overview', 'createAlert', generalInformation, true)}
      {accordionItem(2, 'Filter settings', 'createAlert', filterSelection ? (!filter ? null : <CDCFilterComponent filterSelection={filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} />) : <p>No filters available for this cdc</p>)}
    </div>
  </>);
}

