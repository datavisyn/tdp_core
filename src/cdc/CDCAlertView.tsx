import get from 'lodash.get';
import React from 'react';
import Select from 'react-select';
import {runAlert} from '.';
import {confirmAlertById, deleteAlert, editAlert, saveAlert} from './api';
import {CDCFilterComponent} from './CDCFilterComponent';
import {IAlert, IFilter, IFilterComponent, IUploadAlert} from './interfaces';

interface ICDCEditAlert {
  alertData: IUploadAlert;
  setAlertData: (formData: IUploadAlert) => void;
  filterSelection: IFilter<any>[] | undefined;
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
  const [validName, setValidName] = React.useState(true);
  const [validFilter, setValidFilter] = React.useState(true);

  React.useEffect(() => {
    setEditMode(false);
    setDeleteMode(false);
  }, [selectedAlert]);

  React.useEffect(() => {
    setValidFilter(filter?.children.length > 0);
  }, [filter]);

  React.useEffect(() => {
    setValidName(alertData?.name?.trim().length > 0);
  }, [alertData.name]);

  const confirmChanges = async (id: number) => {
    const alert = await confirmAlertById(id);
    onAlertChanged(alert.id);
  };

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

  const literature = () => {
    if (selectedAlert.latest_diff) {
      const change: Map<String, Map<String, {old: string, new: string}>> = new Map();
      selectedAlert.latest_diff?.values_changed?.map((d) => {
        const nestedField = d.field.map((f) => f).join(".");
        if (change.has(d.id)) {
          change.set(d.id, change.get(d.id).set(nestedField, {old: d.old_value, new: d.new_value}));
        } else {
          change.set(d.id, new Map<String, {old: string, new: string}>().set(nestedField, {old: d.old_value, new: d.new_value}));
        }
      });
      return (<>
        <h6>Changed data:</h6>
        <table className="table table-light mt-2">
          <thead>
            <tr>
              {selectedAlert.compare_columns?.map((field, i) => <th key={`header-${i}`} scope="col">{field}</th>)}
            </tr>
          </thead>
          <tbody>
            {selectedAlert.latest_diff.dictionary_item_added?.map((d) => {
              const data = selectedAlert.latest_fetched_data.find(a => a.id === d);
              return (<tr key={d} className="table-success">
                {selectedAlert.compare_columns?.map((field, i) => <td key={`added-${i}`} >{get(data, field)}</td>)}
              </tr>);
            })}
            {selectedAlert.latest_diff.dictionary_item_removed?.map((d) => {
              const data = selectedAlert.confirmed_data.find(a => a.id === d);
              return (<tr key={d} className="table-danger">
                {selectedAlert.compare_columns?.map((field, i) => <td key={`removed-${i}`}>{get(data, field)}</td>)}
              </tr>);
            })}
            {[...change.keys()]?.map((id, i) => {
              const oldData = selectedAlert.confirmed_data?.find(a => a.id === id);
              return (<tr key={`tr-changed-${i}`} className="table-primary">
                {selectedAlert.compare_columns?.map((field, index) => change.get(id).has(field) ? <td key={`changed-${i}-${index}`}><s>{change.get(id).get(field).old}</s> {change.get(id).get(field).new}</td> : <td key={`changed-${i}-${index}`}>{get(oldData, field)}</td>)}
              </tr>);
            })}
          </tbody>
        </table>
        <div className="d-md-flex justify-content-md-end">
          <button title="Confirm changes" className="btn btn-primary" onClick={() => confirmChanges(selectedAlert.id)}>Confirm</button>
        </div>
      </>);
    }
    return <p>No new data available</p>;
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
          <div id="collapse-one" className="p-4 accordion-collapse collapse show" aria-labelledby="heading-one" data-bs-parent="#editAlert">
            {literature()}
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
              <Select
                isDisabled={!creationMode && !editMode}
                options={cdcs.map((c) => {return {label: c, value: c};})}
                value={{label: alertData.cdc_id, value: alertData.cdc_id}}
                onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
              />
            </div>
            <div className="mb-3 col pe-2">
              <label className="form-label">Change Fields</label>
              <Select
                isMulti
                isDisabled={!creationMode && !editMode}
                closeMenuOnSelect={false}
                options={compareColumnOptions.map((col) => {return {label: col, value: col}})}
                value={alertData.compare_columns?.map((col) => {return {label: col, value: col}})}
                onChange={(e) => setAlertData({...alertData, compare_columns: [...e.map((col) => col.value)]})}
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
              <CDCFilterComponent filterSelection={!creationMode && !editMode ? null : filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} isInvalid={!validFilter} />
              :
              <p>No filters available for this cdc</p>}
          </div>
        </div>
      </div>
    </div>
  </>);
}


/*
const generalInformation =
  <>
    <div className="row mb-3">
      <div className="mb-3 col">
        <label className="form-label">Name</label>
        {!editMode ?
          <h6>{alertData.name}</h6>
          :
          <><input type="text" className={`form-control${validName ? '' : ' is-invalid'}`} value={alertData.name} onChange={(e) => setAlertData({...alertData, name: e.target.value})} />
            {validName ? null :
              <div className="invalid-feedback">
                Name must not be empty!
              </div>}</>
        }
      </div>
      <div className="mb-3 col pe-2">
        <label className="form-label">CDC</label>
        <Select
          isDisabled={!editMode}
          options={cdcs.map((c) => {return {label: c, value: c};})}
          value={{label: alertData.cdc_id, value: alertData.cdc_id}}
          onChange={(e) => setAlertData({...alertData, cdc_id: e.value})}
        />
      </div>
      <div className="mb-3 col pe-2">
        <label className="form-label">Change Fields</label>
        <Select
          isDisabled={!editMode}
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
          <input className="form-check-input" type="checkbox" disabled={!editMode} checked={alertData.enable_mail_notification} onChange={(e) => setAlertData({...alertData, enable_mail_notification: e.target.checked})} />
          <label className="form-check-label ms-2">Send me an email</label>
        </div>
      </div>
    </div>
    <div>
      {filterSelection || !filter ?
        <CDCFilterComponent filterSelection={!editMode ? null : filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} disableFilter={!editMode} isInvalid={!validFilter} />
        :
        <p>No filters available for this cdc</p>}
    </div>
  </>;


const alertInformation =
<>
<div className="row mb-3">
  <div className="mb-3 col">
    <label className="form-label">Name</label>
      <h6>{alertData.name}</h6>
  </div>
  <div className="mb-3 col pe-2">
    <label className="form-label">CDC</label>
    <Select
      isDisabled={true}
      value={{label: alertData.cdc_id, value: alertData.cdc_id}}
    />
  </div>
  <div className="mb-3 col pe-2">
    <label className="form-label">Change Fields</label>
    <Select
      isDisabled={true}
      isMulti
      value={alertData.compare_columns}
    />
  </div>
  <div className="mb-3 col">
    <label className="form-label">Email notification</label>
    <div className="form-check">
      <input className="form-check-input" type="checkbox" disabled={true} checked={alertData.enable_mail_notification} />
      <label className="form-check-label ms-2">Send me an email</label>
    </div>
  </div>
</div>
<div>
  {filterSelection || !filter ?
    <CDCFilterComponent  filterComponents={filterComponents} filter={filter} setFilter={setFilter} />
    :
    <p>No filters available for this cdc</p>}
</div>
</>;

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

const alterAlert =
<>
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
</>;

*/
