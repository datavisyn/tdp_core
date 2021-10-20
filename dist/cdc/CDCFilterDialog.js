import * as React from 'react';
import ReactDOM from 'react-dom';
import { BSModal, useAsync } from '../hooks';
import { getAlerts, saveAlert } from './api';
import { CDCCreateEditAlert } from './CDCCreateEditAlert';
import { createCDCGroupingFilter } from './CDCGroupingFilter';
import { v4 as uuidv4 } from 'uuid';
import { createCDCTextFilter } from './CDCTextFilter';
import { createCDCCheckboxFilter } from './CDCCheckboxFilter';
import { createCDCRangeFilter } from './CDCRangeFilter';
export function CDCFilterDialog() {
    const [selectedAlert, setSelectedAlert] = React.useState();
    const [showDialog, setShowDialog] = React.useState(false);
    const [creationMode, setCreationMode] = React.useState(false);
    const [filter, setFilter] = React.useState();
    const [formData, setFormData] = React.useState();
    React.useEffect(() => {
        setFormData({
            name: "",
            enable_mail_notification: false,
            cdc_id: "",
        });
        setFilter({
            ...createCDCGroupingFilter(uuidv4(), 'Drop filters here'),
            disableDragging: true,
            disableRemoving: true
        });
    }, []);
    React.useEffect(() => {
        console.log(selectedAlert);
        if (selectedAlert) {
            setFormData(selectedAlert);
            if (selectedAlert.filter) {
                JSON.parse(selectedAlert.filter).then((test) => {
                    setFilter(test);
                }).catch((e) => console.log(e));
            }
        }
    }, [selectedAlert]);
    const filterSelection = [
        createCDCGroupingFilter(uuidv4(), 'Grouping Filter'),
        createCDCTextFilter(uuidv4(), 'Text Filter', { filter: [{ field: 'field1', value: [] }], fields: [{ field: 'field1', options: ['hallo', 'hier', 'steht', 'text'] }, { field: 'field2', options: ['tschüss', 'hier', 'nicht'] }, { field: 'field3', options: ['test', 'noch ein test', 'hi'] }] }),
        createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', { fields: ['Eins', 'zwei', 'dRei'], filter: [] }),
        createCDCRangeFilter(uuidv4(), 'Range Filter', { min: 1950, max: 2021 }),
    ];
    const { status: alertStatus, error: alertError, execute: alertExecute, value: alerts } = useAsync(getAlerts, true);
    const onSave = () => {
        //TODO: put group away again
        saveAlert({ ...formData, filter: JSON.stringify(filter), group: "hi" });
    };
    // console.log(alerts);
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
                                    React.createElement("div", { className: "d-flex w-100 justify-content-between" },
                                        React.createElement("h5", null, "Your alerts"),
                                        React.createElement("small", null,
                                            React.createElement("button", { className: "btn btn-secondary", onClick: () => { setCreationMode(true); setSelectedAlert(null); } }, "+"))),
                                    alertStatus === 'pending' ? React.createElement(React.Fragment, null, "Loading...") : null,
                                    alertStatus === 'error' ? React.createElement(React.Fragment, null,
                                        "Error ",
                                        alertError.toString()) : null,
                                    alertStatus === 'success' ? React.createElement("div", { className: "list-group" }, alerts.map((alert, i) => React.createElement("div", { key: i },
                                        React.createElement("a", { href: "#", className: `list-group-item list-group-item-action${selectedAlert === alert ? " border-primary" : ""}`, onClick: () => { setSelectedAlert(alert); setCreationMode(false); }, "aria-current": "true" },
                                            React.createElement("div", { className: "d-flex w-100 justify-content-between" },
                                                React.createElement("h6", { className: "mb-1" },
                                                    alert.name,
                                                    " ",
                                                    React.createElement("small", { className: "text-muted" },
                                                        "for ",
                                                        alert.cdc_id),
                                                    " "),
                                                React.createElement("small", null,
                                                    React.createElement("span", { className: "badge bg-primary rounded-pill" }, "1"))),
                                            React.createElement("p", { className: "mb-1" }, "Some placeholder content in a paragraph."),
                                            React.createElement("small", null,
                                                "last confirmed: ",
                                                alert.confirmation_date))))) : null),
                                React.createElement("div", { className: "col-8 overflow-auto" }, creationMode ? (React.createElement(CDCCreateEditAlert, { filter: filter, setFilter: setFilter, formData: formData, setFormData: setFormData, filterSelection: filterSelection })) : (selectedAlert ? React.createElement(CDCCreateEditAlert, { filter: filter, setFilter: setFilter, formData: formData, setFormData: setFormData, filterSelection: filterSelection, selectedAlert: selectedAlert }) : null)))),
                        React.createElement("div", { className: "modal-footer" },
                            React.createElement("button", { type: "button", className: "btn btn-secondary", "data-bs-dismiss": "modal" }, "Close"),
                            React.createElement("button", { type: "button", className: "btn btn-primary", onClick: () => onSave() }, "Save changes")))))));
}
export class CDCFilterDialogClass {
    constructor(parent) {
        this.node = document.createElement('div');
        parent.appendChild(this.node);
        this.init();
    }
    init() {
        ReactDOM.render(React.createElement(CDCFilterDialog, null), this.node);
    }
}
//# sourceMappingURL=CDCFilterDialog.js.map