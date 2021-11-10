import React from 'react';
import Select from 'react-select';
import {runAlert} from '..';
import {saveAlert} from './api';
import {CDCFilterComponent} from './CDCFilterComponent';
import {IFilter, IFilterComponent, IUploadAlert} from './interfaces';

interface ICDCCreateAlert {
  alertData: IUploadAlert;
  setAlertData: (formData: IUploadAlert) => void;
  filterSelection: IFilter<any>[] | undefined;
  filter: IFilter;
  setFilter: (filter: IFilter) => void;
  filterComponents: {[key: string]: {component: IFilterComponent<any>, config?: any}};
  onAlertChanged: (id?: number) => void;
  setCreationMode: (mode: boolean) => void;
  cdcs: string[];
  compareColumnOptions: string[];
}

export function CDCCreateAlert({alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, setCreationMode, cdcs, compareColumnOptions}: ICDCCreateAlert) {
  const [validFilter, setValidFilter] = React.useState(true);
  const [validName, setValidName] = React.useState(true);

  React.useEffect(() => {
    setValidFilter(filter?.children.length > 0);
  }, [filter]);

  React.useEffect(() => {
    setValidName(alertData?.name?.trim().length > 0);
  }, [alertData.name]);

  const onSave = async () => {
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

  return (<>
    <div className="d-flex w-100 justify-content-between mb-1">
      <h5>Create alert</h5>
      <small>
        <button title="Save changes" className="btn btn-text-secondary" onClick={() => onSave()}><i className="fas fa-save"></i></button>
        <button title="Discard changes" className="btn btn-text-secondary ms-1" onClick={() => setCreationMode(false)}><i className="fas fa-times"></i></button>
      </small>
    </div>
    <div className="card p-3">
      <div className="row mb-3">
        <div className="mb-3 col">
          <label className="form-label">Name</label>
          <input type="text" className={`form-control${validName ? '' : ' is-invalid'}`} value={alertData.name} onChange={(e) => setAlertData({...alertData, name: e.target.value})} required />
          {validName ? null :
            <div className="invalid-feedback">
              Name must not be empty!
            </div>}
        </div>
        <div className="mb-3 col">
          <label className="form-label">CDC</label>
          <Select
            options={cdcs.map((c) => {return {label: c, value: c};})}
            value={{label: alertData.cdc_id, value: alertData.cdc_id}}
            onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
          />
        </div>
        <div className="mb-3 col">
          <label className="form-label">Change Fields</label>
          <Select
            isMulti
            closeMenuOnSelect={false}
            options={compareColumnOptions}
            value={alertData.compare_columns}
            onChange={(e) => setAlertData({...alertData, compare_columns: [...e]})}
          />
        </div>
        <div className="mb-3 col">
          <label className="form-label">Email notification</label>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
            <label className="form-check-label ms-2">Send me an email</label>
          </div>
        </div>
      </div>
      <div>
        {filterSelection || !filter ?
          <CDCFilterComponent filterSelection={filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} isInvalid={!validFilter} />
          :
          <p>No filters available for this cdc</p>
        }
      </div>
    </div>
  </>);
}

