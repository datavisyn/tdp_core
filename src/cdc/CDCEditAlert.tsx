import React from "react"
import {AccordionView} from "./AccordionView";
import {CDCFilterComponent} from "./CDCFilterComponent"
import {IAlert} from "./interface";

interface ICDCEditAlertProps {
  selectedAlert: IAlert;
}

export function CDCEditAlert({selectedAlert} : ICDCEditAlertProps) {
  const data = [
    {title: 'Alert overview', JSX: <p>text aufgeklappt</p>, show: true},
    {title: 'New literature', JSX: <p>text aufgeklappt</p>},
    {title: 'Filter settings', JSX: <CDCFilterComponent />}
  ]
  
  return (<>
      <h5>Your options</h5>
      <AccordionView parentId={"filterOptions"} data={data}/>
  </>);
}