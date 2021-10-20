import React from "react";
import {ICDCFormData} from ".";
import {AccordionView} from "./AccordionView";
import {CDCFilterComponent} from "./CDCFilterComponent";
import {IAlert, IFilter} from "./interface";

interface ICDCCreateEditAlert {
  formData: ICDCFormData;
  setFormData: (formData: ICDCFormData) => void;
  selectedAlert?: IAlert;
  filterSelection: IFilter<any>[];
  filter: IFilter;
  setFilter: (filter: IFilter) => void;
}

export function CDCCreateEditAlert({formData, setFormData, filterSelection, selectedAlert, filter, setFilter}: ICDCCreateEditAlert) {

  const generalInformation = 
  (<>
    <h6>Name</h6>
    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}/>
    <h6>Email notification</h6>
    <input
      className="form-check-input"
      type="checkbox"
      checked={formData.enable_mail_notification}
      onChange={(e) => setFormData({...formData, enable_mail_notification: e.target.checked})}
    />
    <h6>CDC</h6>
    <input type="text" value={formData.cdc_id} onChange={(e) => setFormData({...formData, cdc_id: e.target.value})}/>
  </>);

  const data = selectedAlert ? [
    {title: 'Alert overview', JSX: generalInformation, show: true},
    {title: 'New literature', JSX: <p>text aufgeklappt</p>},
    {title: 'Filter settings', JSX: <CDCFilterComponent filterSelection={filterSelection} filter={filter} setFilter={setFilter} />}
  ] : [
    {title: "General information", JSX: generalInformation, show: true},
    {title: "Edit filters", JSX: <CDCFilterComponent filterSelection={filterSelection} filter={filter} setFilter={setFilter} />}
  ];

  return (<>
      <h5>Your options</h5>
      <AccordionView parentId={"createAlert"} data={data} />
  </>);
}