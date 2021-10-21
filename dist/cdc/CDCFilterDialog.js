import * as React from 'react';
import ReactDOM from 'react-dom';
import { BSModal, useAsync } from '../hooks';
import { deleteAlert, getAlerts, saveAlert } from './api';
import { CDCCreateEditAlert } from './CDCCreateEditAlert';
import { CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter } from './CDCGroupingFilter';
import { v4 as uuidv4 } from 'uuid';
import { CDCTextFilter, CDCTextFilterId, createCDCTextFilter } from './CDCTextFilter';
import { CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter } from './CDCCheckboxFilter';
import { CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter } from './CDCRangeFilter';
const DEFAULTFORMDATA = { name: "", enable_mail_notification: false, cdc_id: "" };
const DEFAULTFILTER = { ...createCDCGroupingFilter(uuidv4(), 'Drop filters here'), disableDragging: true, disableRemoving: true };
export function CDCFilterDialog({ filterComponents, filtersByCDC }) {
    const [selectedAlert, setSelectedAlert] = React.useState();
    const [showDialog, setShowDialog] = React.useState(false);
    const [creationMode, setCreationMode] = React.useState(false);
    const [filter, setFilter] = React.useState();
    const [formData, setFormData] = React.useState();
    const [editMode, setEditMode] = React.useState(false);
    const [alertList, setAlertList] = React.useState();
    React.useEffect(() => {
        setFormData(DEFAULTFORMDATA);
        setFilter(DEFAULTFILTER);
    }, []);
    React.useEffect(() => {
        console.log(selectedAlert);
        setEditMode(false);
        if (selectedAlert) {
            setFormData(selectedAlert);
            if (selectedAlert.filter) {
                try {
                    setFilter(JSON.parse(selectedAlert.filter));
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }, [selectedAlert]);
    const { status: alertStatus, error: alertError, execute: alertExecute, value: alerts } = useAsync(getAlerts, true);
    React.useEffect(() => {
        setAlertList(alerts);
    }, [alerts]);
    const onSave = () => {
        //TODO: put group away again
        saveAlert({ ...formData, filter: JSON.stringify(filter) });
    };
    const editButton = !creationMode ? (!editMode && selectedAlert ? (React.createElement("button", { className: "btn btn-secondary", onClick: () => setEditMode(true) },
        React.createElement("i", { className: "fas fa-pencil-alt" }))) : (React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Save changes", className: "btn btn-secondary", onClick: () => setEditMode(false) },
            React.createElement("i", { className: "fas fa-save" })),
        React.createElement("button", { title: "Discard changes", className: "btn btn-secondary ms-1", onClick: () => setEditMode(false) },
            React.createElement("i", { className: "fas fa-ban" }))))) : null;
    const onCreateButtonClick = () => {
        setCreationMode(true);
        setSelectedAlert(null);
        setFormData(DEFAULTFORMDATA);
        setFilter(DEFAULTFILTER);
    };
    const onDeleteButton = (id) => {
        setAlertList([...alertList.filter((alert) => alert.id !== id)]);
        deleteAlert(id);
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
                                                    React.createElement("span", { className: "badge bg-primary rounded-pill" }, "1"),
                                                    React.createElement("span", { className: "badge bg-secondary rounded-pill", onClick: () => onDeleteButton(alert.id) },
                                                        React.createElement("i", { className: "fas fa-trash" })))),
                                            React.createElement("p", { className: "mb-1" }, "Some placeholder content in a paragraph."),
                                            React.createElement("small", null,
                                                "last confirmed: ",
                                                alert.confirmation_date))))) : null),
                                React.createElement("div", { className: "col-8 overflow-auto" }, selectedAlert || creationMode ? React.createElement(React.Fragment, null,
                                    React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
                                        React.createElement("h5", null, "Your options"),
                                        React.createElement("small", null, editButton)),
                                    React.createElement(CDCCreateEditAlert, { editMode: selectedAlert ? editMode : null, setEditMode: selectedAlert ? setEditMode : null, filter: filter, setFilter: setFilter, formData: formData, setFormData: setFormData, filterSelection: filtersByCDC[selectedAlert.cdc_id], filterComponents: filterComponents, selectedAlert: selectedAlert ? selectedAlert : null })) : null))),
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
        ReactDOM.render(React.createElement(CDCFilterDialog, { filterComponents: {
                [CDCGroupingFilterId]: CDCGroupingFilter,
                [CDCCheckboxFilterId]: CDCCheckboxFilter,
                [CDCTextFilterId]: CDCTextFilter,
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