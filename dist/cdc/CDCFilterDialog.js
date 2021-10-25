import * as React from 'react';
import ReactDOM from 'react-dom';
import { BSModal, useAsync } from '../hooks';
import { deleteAlert, getAlerts } from './api';
import { CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter } from './CDCGroupingFilter';
import { v4 as uuidv4 } from 'uuid';
import { CDCTextFilter, CDCTextFilterId, createCDCTextFilter } from './CDCTextFilter';
import { CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter } from './CDCCheckboxFilter';
import { CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter } from './CDCRangeFilter';
import { CDCCreateAlert } from './CDCCreateAlert';
import { CDCEditAlert } from './CDCEditAlert';
export const DEFAULTALERTDATA = { name: "", enable_mail_notification: false, cdc_id: "demo", filter_dump: "", filter_query: "" };
export const DEFAULTFILTER = { ...createCDCGroupingFilter(uuidv4(), 'Drop filters here'), disableDragging: true, disableRemoving: true };
export const accordionItem = (index, title, parentId, child, show) => {
    parentId = parentId.trim();
    return (React.createElement("div", { key: index, className: "accordion-item" },
        React.createElement("h2", { className: "accordion-header", id: `heading${index}` },
            React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#collapse${index}`, "aria-expanded": "true", "aria-controls": `collapse${index}` }, title)),
        React.createElement("div", { id: `collapse${index}`, className: `p-2 accordion-collapse collapse${show ? " show" : ""}`, "aria-labelledby": `heading${index}`, "data-bs-parent": `#${parentId}` }, child)));
};
export function CDCFilterDialog({ filterComponents, filtersByCDC }) {
    const [selectedAlert, setSelectedAlert] = React.useState();
    const [showDialog, setShowDialog] = React.useState(false);
    const [creationMode, setCreationMode] = React.useState(false);
    const [filter, setFilter] = React.useState();
    const [alertData, setAlertData] = React.useState();
    const [alertList, setAlertList] = React.useState();
    const { status: alertStatus, error: alertError, execute: alertExecute, value: alerts } = useAsync(getAlerts, true);
    React.useEffect(() => {
        setAlertData(DEFAULTALERTDATA);
        setFilter(DEFAULTFILTER);
    }, []);
    React.useEffect(() => {
        setAlertList(alerts);
    }, [alerts]);
    const onCreateButtonClick = () => {
        setCreationMode(true);
        setSelectedAlert(null);
        setAlertData(DEFAULTALERTDATA);
        setFilter(DEFAULTFILTER);
    };
    const onDeleteButton = async (id) => {
        setAlertList([...alertList.filter((alert) => alert.id !== id)]);
        await deleteAlert(id);
        if (selectedAlert.id === id) {
            setSelectedAlert(null);
        }
    };
    const onAlertClick = async (alert) => {
        console.log(alert);
        setAlertData(alert);
        setFilter(JSON.parse(alert.filter_dump));
        setCreationMode(false);
        setSelectedAlert(alert);
    };
    return React.createElement(React.Fragment, null,
        React.createElement("a", { style: { color: 'white', cursor: 'pointer' }, onClick: () => setShowDialog(true) },
            React.createElement("i", { className: "fas fa-filter", style: { marginRight: 4 } }),
            " Alert Filter"),
        React.createElement(BSModal, { show: showDialog, setShow: setShowDialog },
            React.createElement("div", { className: "modal fade", tabIndex: -1 },
                React.createElement("div", { className: "modal-dialog", style: { maxWidth: '90%' } },
                    React.createElement("div", { className: "modal-content" },
                        React.createElement("div", { className: "modal-header" },
                            React.createElement("h5", { className: "modal-title" }, "Alerts"),
                            React.createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" })),
                        React.createElement("div", { className: "modal-body" },
                            React.createElement("div", { className: "row" },
                                React.createElement("div", { className: "col-4 overflow-auto" },
                                    React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
                                        React.createElement("h5", null, "Your alerts"),
                                        React.createElement("small", null,
                                            React.createElement("button", { className: "btn btn-secondary", onClick: () => onCreateButtonClick() }, "+"))),
                                    alertStatus === 'pending' ? React.createElement(React.Fragment, null, "Loading...") : null,
                                    alertStatus === 'error' ? React.createElement(React.Fragment, null,
                                        "Error ",
                                        alertError.toString()) : null,
                                    alertStatus === 'success' ? React.createElement("div", { className: "list-group" }, alertList.map((alert) => React.createElement("div", { key: alert.id },
                                        React.createElement("a", { href: "#", className: `list-group-item list-group-item-action${selectedAlert === alert ? " border-primary" : ""}`, onClick: () => onAlertClick(alert), "aria-current": "true" },
                                            React.createElement("div", { className: "d-flex w-100 justify-content-between" },
                                                React.createElement("h6", { className: "mb-1" },
                                                    alert.name,
                                                    " ",
                                                    React.createElement("small", { className: "text-muted" },
                                                        "for ",
                                                        alert.cdc_id),
                                                    " "),
                                                React.createElement("small", null,
                                                    React.createElement("span", { className: "badge bg-primary rounded-pill" }, "1"),
                                                    React.createElement("span", { className: "badge bg-secondary rounded-pill", onClick: () => onDeleteButton(alert.id) },
                                                        React.createElement("i", { className: "fas fa-trash" })))),
                                            React.createElement("p", { className: "mb-1" }, "Some placeholder content in a paragraph."),
                                            React.createElement("small", null,
                                                "last confirmed: ",
                                                alert.confirmation_date))))) : null),
                                React.createElement("div", { className: "col-8 overflow-auto" }, selectedAlert ?
                                    React.createElement(CDCEditAlert, { alertData: alertData, setAlertData: setAlertData, filter: filter, setFilter: setFilter, filterSelection: filtersByCDC[selectedAlert === null || selectedAlert === void 0 ? void 0 : selectedAlert.cdc_id], filterComponents: filterComponents, alertList: alertList, setAlertList: setAlertList, selectedAlert: selectedAlert, setSelctedAlert: setSelectedAlert })
                                    :
                                        creationMode ?
                                            React.createElement(CDCCreateAlert, { alertData: alertData, setAlertData: setAlertData, filter: filter, setFilter: setFilter, filterComponents: filterComponents, filterSelection: filtersByCDC["demo"], alertList: alertList, setAlertList: setAlertList, setSelectedAlert: setSelectedAlert, setCreationMode: setCreationMode })
                                            : null))),
                        React.createElement("div", { className: "modal-footer" },
                            React.createElement("button", { type: "button", className: "btn btn-secondary", "data-bs-dismiss": "modal" }, "Close")))))));
}
export class CDCFilterDialogClass {
    constructor(parent) {
        this.node = document.createElement('div');
        parent.appendChild(this.node);
        this.init();
    }
    init() {
        ReactDOM.render(React.createElement(CDCFilterDialog, { filterComponents: {
                [CDCGroupingFilterId]: CDCGroupingFilter,
                [CDCTextFilterId]: CDCTextFilter,
                [CDCCheckboxFilterId]: CDCCheckboxFilter,
                [CDCRangeFilterId]: CDCRangeFilter
            }, filtersByCDC: {
                'demo': [
                    createCDCGroupingFilter(uuidv4(), 'Grouping Filter'),
                    createCDCTextFilter(uuidv4(), 'Text Filter', { filter: [{ field: 'field1', value: [] }], fields: [{ field: 'field1', options: ['hallo', 'hier', 'steht', 'text'] }, { field: 'field2', options: ['tschüss', 'hier', 'nicht'] }, { field: 'field3', options: ['test', 'noch ein test', 'hi'] }] }),
                    createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', { fields: ['Eins', 'zwei', 'dRei'], filter: [] }),
                    createCDCRangeFilter(uuidv4(), 'Range Filter', { min: 1950, max: 2021 }),
                ]
            } }), this.node);
    }
}
//# sourceMappingURL=CDCFilterDialog.js.map