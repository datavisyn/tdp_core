import React from "react";
import {ICDCFormData} from ".";
import {CDCFilterComponent} from "./CDCFilterComponent";
import {IAlert, IFilter, IFilterComponent} from "./interface";
import {v4 as uuidv4} from 'uuid';

interface ICDCCreateEditAlert {
  formData: ICDCFormData;
  setFormData: (formData: ICDCFormData) => void;
  selectedAlert?: IAlert;
  filterSelection: IFilter<any>[] | undefined; // TODO: Add error message if null --> no filters available for this cdc
  filter: IFilter;
  setFilter: (filter: IFilter) => void;
  editMode?: boolean;
  setEditMode?: (editMode: boolean) => void;
  filterComponents: {[key: string]: IFilterComponent<any>};
}

export function CDCCreateEditAlert({formData, setFormData, filterSelection, selectedAlert, filter, setFilter, editMode, setEditMode, filterComponents}: ICDCCreateEditAlert) {
  const generalInformation = formData ?
    (<>
      <div className="mb-3">
        <label className="form-label">Name</label>
        {selectedAlert && !editMode ?
          <p>{formData.name}</p>
          :
          <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        }
      </div>
      <div className="mb-3">
        <label className="form-label">CDC</label>
        {selectedAlert && !editMode ?
          <p>{formData.name}</p>
          :
          <input type="text" className="form-control" value={formData.cdc_id} onChange={(e) => setFormData({...formData, cdc_id: e.target.value})} />
        }
      </div>
      <input className="form-check-input" type="checkbox" disabled={selectedAlert && !editMode} checked={formData.enable_mail_notification} onChange={(e) => setFormData({...formData, enable_mail_notification: e.target.checked})} />
      <label className="form-check-label ms-2">Email notification</label>
      <div className="mb-3 form-check"></div>
    </>) : null;

  const accordionItem = (title: string, parentId: string, child: JSX.Element, show?: boolean) => {
    const index = uuidv4();
    parentId = parentId.trim();
    return (
      <div key={index} className="accordion-item">
        <h2 className="accordion-header" id={`heading${index}`}>
          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="true" aria-controls={`collapse${index}`}>
            {title}
          </button>
        </h2>
        <div id={`collapse${index}`} className={`p-2 accordion-collapse collapse${show ? " show" : ""}`} aria-labelledby={`heading${index}`} data-bs-parent={`#${parentId}`}>
          {child}
        </div>
      </div>
    );
  };

  return (
    <div className="accordion" id="createAlert">
      {accordionItem('Alert overview', 'createAlert', generalInformation, true)}
      {selectedAlert ? accordionItem('New literature', 'createAlert', <p>text aufgeklappt</p>) : null}
      {accordionItem('Filter settings', 'createAlert', !filter ? null : <CDCFilterComponent filterSelection={selectedAlert && !editMode ? null : filterSelection} filterComponents={filterComponents} filter={filter} setFilter={setFilter} />)}
    </div>
  );
}
