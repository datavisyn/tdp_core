import React from "react";
import { AccordionView } from "./AccordionView";
import { CDCFilterComponent } from "./CDCFilterComponent";
import { createCDCGroupingFilter } from "./CDCGroupingFilter";
import { createCDCRangeFilter } from "./CDCRangeFilter";
import { createCDCTextFilter } from "./CDCTextFilter";
import { v4 as uuidv4 } from 'uuid';
import { createCDCCheckboxFilter } from "./CDCCheckboxFilter";
export function CDCEditAlert({ selectedAlert }) {
    const filterSelection = [
        createCDCGroupingFilter(uuidv4(), 'Grouping Filter'),
        createCDCTextFilter(uuidv4(), 'Text Filter', { filter: [{ field: 'field1', value: [] }], fields: [{ field: 'field1', options: ['hallo', 'hier', 'steht', 'text'] }, { field: 'field2', options: ['tschüss', 'hier', 'nicht'] }, { field: 'field3', options: ['test', 'noch ein test', 'hi'] }] }),
        createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', { fields: ['Eins', 'zwei', 'dRei'], filter: [] }),
        createCDCRangeFilter(uuidv4(), 'Range Filter', { min: 1950, max: 2021 }),
    ];
    const data = [
        { title: 'Alert overview', JSX: React.createElement("p", null, "text aufgeklappt"), show: true },
        { title: 'New literature', JSX: React.createElement("p", null, "text aufgeklappt") },
        { title: 'Filter settings', JSX: React.createElement(CDCFilterComponent, { filterSelection: filterSelection, filter: filter, setFilter: setFilter }) }
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement("h5", null, "Your options"),
        React.createElement(AccordionView, { parentId: "filterOptions", data: data })));
}
//# sourceMappingURL=CDCEditAlert.js.map