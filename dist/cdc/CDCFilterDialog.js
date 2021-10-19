import * as React from 'react';
import ReactDOM from 'react-dom';
import { BSModal, useAsync } from '../hooks';
import { getAlerts } from './api';
import { CDCEditAlert } from './CDCEditAlert';
import { CDCCreateAlert } from './CDCCreateAlert';
export function CDCFilterDialog() {
    const [selectedAlert, setSelectedAlert] = React.useState();
    const [showDialog, setShowDialog] = React.useState(false);
    const [creationMode, setCreationMode] = React.useState(false);
    const { status: alertStatus, error: alertError, execute: alertExecute, value: alerts } = useAsync(getAlerts, true);
    console.log(alerts);
    //filter settings reusable // alert overview / edit alert
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
                                    alertStatus === 'success' ? React.createElement("div", { className: "list-group" }, alerts.map((alert, i) => React.createElement(React.Fragment, null,
                                        React.createElement("a", { href: "#", className: `list-group-item list-group-item-action${selectedAlert === alert ? " border-primary" : ""}`, key: i, onClick: () => { setSelectedAlert(alert); setCreationMode(false); }, "aria-current": "true" },
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
                                React.createElement("div", { className: "col-8 overflow-auto" }, creationMode ? (React.createElement(CDCCreateAlert, null)) : (selectedAlert ? React.createElement(CDCEditAlert, { selectedAlert: selectedAlert }) : null)))),
                        React.createElement("div", { className: "modal-footer" },
                            React.createElement("button", { type: "button", className: "btn btn-secondary", "data-bs-dismiss": "modal" }, "Close"),
                            React.createElement("button", { type: "button", className: "btn btn-primary" }, "Save changes")))))));
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