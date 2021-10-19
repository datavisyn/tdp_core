import React, {useState} from "react";
import {AccordionView} from "./AccordionView";
import {CDCFilterComponent} from "./CDCFilterComponent";


export function CDCCreateAlert() {

  const [alertName, setAlertName] = React.useState<string>("");

  const generalInformation = 
  (<>
    <h6>Name</h6>
    <input type="text" value={alertName} onChange={(e) => setAlertName(e.target.value)} />
  </>);

  const data = [
    {title: "General information", JSX: generalInformation, show: true},
    {title: "Edit filters", JSX: <CDCFilterComponent />}
  ];

  return (<>
      <h5>Your options</h5>
      <AccordionView parentId={"createAlert"} data={data} />
  </>);
}