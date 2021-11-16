import * as React from 'react';
import ReactDOM from 'react-dom';
import { BSModal, useAsync } from '../hooks';
import { getAlerts, runAllAlerts } from './api';
import { CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter, CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter, CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter } from './filter';
import { v4 as uuidv4 } from 'uuid';
import { CDCTextFilter, CDCTextFilterId, createCDCTextFilter } from './filter/CDCTextFilter';
import { CDCAlertView } from './alert/CDCAlertView';
import { ErrorMessage } from './common';
export const CDC_DEFAULT_ALERT_DATA = () => ({ name: '', enable_mail_notification: false, cdc_id: 'JSONPlaceholderUserCDC', filter: createCDCGroupingFilter(uuidv4()), compare_columns: null });
export function CDCFilterDialog({ cdcConfig }) {
    const [selectedAlert, setSelectedAlert] = React.useState(null);
    const [showDialog, setShowDialog] = React.useState(false);
    const [creationMode, setCreationMode] = React.useState(false);
    const [alertData, setAlertData] = React.useState(null);
    const onAlertChanged = async (id) => {
        //refetches alerts and makes new selection
        fetchAlerts().then((alerts) => {
            //if no id there is no need to iterate through alerts
            if (!id) {
                setSelectedAlert(null);
            }
            else {
                setSelectedAlert(alerts.find((alert) => alert.id === id));
            }
        });
    };
    const { status: alertStatus, error: alertError, execute: fetchAlerts, value: alerts } = useAsync(getAlerts, true);
    const { status: syncStatus, error: syncError, execute: doSync } = useAsync(async () => {
        const result = await runAllAlerts();
        if (result.error.length > 0) {
            throw new Error(`Alert(s) could not be synchronized!`);
        }
        onAlertChanged(selectedAlert === null || selectedAlert === void 0 ? void 0 : selectedAlert.id);
    }, false);
    const onCreateButtonClick = () => {
        setCreationMode(true);
        setSelectedAlert(null);
        setAlertData(CDC_DEFAULT_ALERT_DATA());
    };
    const onAlertClick = async (alert) => {
        setAlertData(alert);
        setCreationMode(false);
        setSelectedAlert(alert);
    };
    const reviewStatus = (alert) => {
        var _a, _b;
        switch (true) {
            case (alert.latest_error != null):
                return `Error from Sync: ${(_a = new Date(alert.latest_error_date)) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()}`;
            case (alert.latest_diff != null):
                return 'Pending data revision';
            case (alert.confirmation_date != null):
                return `Last confirmed: ${(_b = new Date(alert.confirmation_date)) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()}`;
            default:
                return 'No data revision yet';
        }
    };
    return React.createElement(React.Fragment, null,
        React.createElement("a", { style: { color: 'white', cursor: 'pointer' }, onClick: () => setShowDialog(true) },
            React.createElement("i", { className: "fas fa-filter", style: { marginRight: 4 } }),
            " Alert Filter"),
        React.createElement(BSModal, { show: showDialog, setShow: setShowDialog },
            React.createElement("div", { className: "modal fade", tabIndex: -1 },
                React.createElement("div", { className: "modal-dialog", style: { maxWidth: '90%' } },
                    React.createElement("div", { className: "modal-content", style: { height: '90vh' } },
                        React.createElement("div", { className: "modal-header" },
                            React.createElement("h5", { className: "modal-title" }, "Alerts"),
                            React.createElement("button", { type: "button", className: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" })),
                        React.createElement("div", { className: "modal-body" },
                            React.createElement("div", { className: "row h-100" },
                                React.createElement("div", { className: `col-3 overflow-auto position-relative h-100 ${alertStatus === 'pending' ? 'tdp-busy-overlay' : ''}` },
                                    syncError ? React.createElement(ErrorMessage, { error: syncError }) : null,
                                    React.createElement("div", { className: "d-md-flex justify-content-md-end mb-1 mt-1" },
                                        React.createElement("button", { type: "button", disabled: syncStatus === 'pending', title: "Synchronize all alerts", className: "btn btn-text-secondary", onClick: () => doSync() },
                                            React.createElement("i", { className: `fas fa-sync ${syncStatus === 'pending' ? 'fa-spin' : ''}` })),
                                        React.createElement("button", { className: "btn btn-text-secondary", onClick: () => onCreateButtonClick() },
                                            React.createElement("i", { className: "fas fa-plus" }))),
                                    alertError ? React.createElement(ErrorMessage, { error: alertError, onRetry: () => fetchAlerts() }) : null,
                                    alertStatus === 'success' ? React.createElement("div", { className: "list-group" }, alerts.sort((a, b) => (b.latest_diff ? 1 : 0) - (a.latest_diff ? 1 : 0)).map((alert) => React.createElement("div", { key: alert.id },
                                        React.createElement("a", { href: "#", className: `list-group-item list-group-item-action ${(selectedAlert === null || selectedAlert === void 0 ? void 0 : selectedAlert.id) === (alert === null || alert === void 0 ? void 0 : alert.id) ? 'border-primary' : ''}`, onClick: () => onAlertClick(alert), "aria-current": "true" },
                                            React.createElement("div", { className: "d-flex w-100 justify-content-between" },
                                                React.createElement("h6", { title: `${alert.name} for ${alert.cdc_id}`, className: "mb-1 overflow-hidden" },
                                                    alert.name,
                                                    " ",
                                                    React.createElement("small", { className: "text-muted" },
                                                        "for ",
                                                        alert.cdc_id)),
                                                React.createElement("small", null,
                                                    (alert === null || alert === void 0 ? void 0 : alert.latest_error) ? React.createElement("i", { className: "fas fa-exclamation-triangle text-danger", title: alert.latest_error }) : null,
                                                    (alert === null || alert === void 0 ? void 0 : alert.latest_diff) && !(alert === null || alert === void 0 ? void 0 : alert.latest_error) ? React.createElement("i", { className: "fas fa-circle text-primary" }) : null)),
                                            React.createElement("small", null, reviewStatus(alert)))))) : null),
                                React.createElement("div", { className: "col-9 overflow-auto" }, selectedAlert || creationMode ?
                                    React.createElement(CDCAlertView, { alertData: alertData, setAlertData: setAlertData, onAlertChanged: onAlertChanged, setCreationMode: setCreationMode, selectedAlert: selectedAlert, creationMode: creationMode, cdcConfig: cdcConfig })
                                    : null))))))));
}
export class CDCFilterDialogClass {
    constructor(parent) {
        this.node = document.createElement('div');
        parent.appendChild(this.node);
        this.init();
    }
    init() {
        ReactDOM.render(React.createElement(CDCFilterDialog, { cdcConfig: {
                'JSONPlaceholderUserCDC': {
                    filters: [
                        createCDCGroupingFilter(uuidv4()),
                        createCDCTextFilter(uuidv4(), 'Select...', null),
                        createCDCCheckboxFilter(uuidv4(), {}),
                        createCDCRangeFilter(uuidv4(), 'id', { min: 1, max: 10 })
                    ],
                    components: {
                        [CDCGroupingFilterId]: { component: CDCGroupingFilter },
                        [CDCTextFilterId]: { component: CDCTextFilter, config: [{ field: 'address.city', options: ['Gwenborough', 'Wisokyburgh', 'McKenziehaven', 'Roscoeview', 'Aliyaview', 'Howemouth'] }, { field: 'address.zipcode', options: ['33263', '23505-1337', '58804-1099'] }, { field: 'name', options: ['Leanne Graham', 'Ervin Howell', 'Glenna Reichert', 'Clementina DuBuque'] }] },
                        [CDCCheckboxFilterId]: { component: CDCCheckboxFilter, config: { fields: ['Eins', 'Zwei', 'Drei'] } },
                        [CDCRangeFilterId]: { component: CDCRangeFilter, config: { minValue: 1, maxValue: 10 } }
                    },
                    compareColumns: ['id', 'name', 'address.street', 'address.city', 'address.zipcode']
                },
                'JSONPlaceholderPostsCDC': {
                    filters: [
                        createCDCGroupingFilter(uuidv4()),
                        createCDCRangeFilter(uuidv4(), 'id', { min: 1, max: 100 })
                    ],
                    components: {
                        [CDCGroupingFilterId]: { component: CDCGroupingFilter },
                        [CDCRangeFilterId]: { component: CDCRangeFilter, config: { minValue: 1, maxValue: 100 } }
                    },
                    compareColumns: ['title', 'body']
                }
            } }), this.node);
    }
}
//# sourceMappingURL=CDCFilterDialog.js.map