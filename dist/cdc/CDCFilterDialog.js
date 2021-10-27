import * as React from 'react';
import ReactDOM from 'react-dom';
import { BSModal, useAsync } from '../hooks';
import { getAlerts, runAlertById } from './api';
import { CDCGroupingFilterId, CDCGroupingFilter, createCDCGroupingFilter } from './CDCGroupingFilter';
import { v4 as uuidv4 } from 'uuid';
import { CDCTextFilter, CDCTextFilterId, createCDCTextFilter } from './CDCTextFilter';
import { CDCCheckboxFilter, CDCCheckboxFilterId, createCDCCheckboxFilter } from './CDCCheckboxFilter';
import { CDCRangeFilter, CDCRangeFilterId, createCDCRangeFilter } from './CDCRangeFilter';
import { CDCCreateAlert } from './CDCCreateAlert';
import { CDCEditAlert } from './CDCEditAlert';
export const DEFAULTALERTDATA = { name: '', enable_mail_notification: false, cdc_id: 'demo', filter_dump: '', filter_query: '' };
export const DEFAULTFILTER = { ...createCDCGroupingFilter(uuidv4(), 'Drop filters here'), disableDragging: true, disableRemoving: true };
export const accordionItem = (index, title, parentId, child, show) => {
    parentId = parentId.trim();
    return (React.createElement("div", { key: index, className: "accordion-item" },
        React.createElement("h2", { className: "accordion-header", id: `heading${index}` },
            React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#collapse${index}`, "aria-expanded": "true", "aria-controls": `collapse${index}` }, title)),
        React.createElement("div", { id: `collapse${index}`, className: `p-2 accordion-collapse collapse${show ? ' show' : ''}`, "aria-labelledby": `heading${index}`, "data-bs-parent": `#${parentId}` }, child)));
};
export function CDCFilterDialog({ filterComponents, filtersByCDC }) {
    const [selectedAlert, setSelectedAlert] = React.useState();
    const [showDialog, setShowDialog] = React.useState(false);
    const [creationMode, setCreationMode] = React.useState(false);
    const [filter, setFilter] = React.useState();
    const [alertData, setAlertData] = React.useState();
    const [cdcs, setCdcs] = React.useState();
    const { status: alertStatus, error: alertError, execute: fetchAlerts, value: alerts } = useAsync(getAlerts, true);
    React.useEffect(() => {
        setAlertData(DEFAULTALERTDATA);
        setFilter(DEFAULTFILTER);
        setCdcs(['demo']);
    }, []);
    const onCreateButtonClick = () => {
        setCreationMode(true);
        setSelectedAlert(null);
        setAlertData(DEFAULTALERTDATA);
        setFilter(DEFAULTFILTER);
    };
    const onAlertClick = async (alert) => {
        setAlertData(alert);
        setFilter(JSON.parse(alert.filter_dump));
        setCreationMode(false);
        setSelectedAlert(alert);
    };
    const onAlertChanged = async () => {
        await fetchAlerts();
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
                                React.createElement("div", { className: "col-3 overflow-auto" },
                                    React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
                                        React.createElement("h5", null, "Your alerts"),
                                        React.createElement("small", null,
                                            React.createElement("button", { className: "btn btn-text-secondary", onClick: () => onCreateButtonClick() },
                                                React.createElement("i", { className: "fas fa-plus" })))),
                                    alertStatus === 'pending' ? React.createElement(React.Fragment, null, "Loading...") : null,
                                    alertStatus === 'error' ? React.createElement(React.Fragment, null,
                                        "Error ",
                                        alertError.toString()) : null,
                                    alertStatus === 'success' ? React.createElement("div", { className: "list-group" }, alerts.map((alert) => {
                                        var _a, _b;
                                        return React.createElement("div", { key: alert.id },
                                            React.createElement("a", { href: "#", className: `list-group-item list-group-item-action${selectedAlert === alert ? ' border-primary' : ''}`, onClick: () => onAlertClick(alert), "aria-current": "true" },
                                                React.createElement("div", { className: "d-flex w-100 justify-content-between" },
                                                    React.createElement("h6", { className: "mb-1" },
                                                        alert.name,
                                                        " ",
                                                        React.createElement("small", { className: "text-muted" },
                                                            "for ",
                                                            alert.cdc_id)),
                                                    ((_b = (_a = JSON.parse(alert === null || alert === void 0 ? void 0 : alert.latest_diff)) === null || _a === void 0 ? void 0 : _a.dictionary_item_added) === null || _b === void 0 ? void 0 : _b.length) > 0 ? React.createElement("small", null,
                                                        React.createElement("i", { className: "fas fa-circle text-danger" })) : null),
                                                React.createElement("small", null, !alert.latest_diff && !alert.confirmed_data ? 'No data revision yet' : alert.latest_diff ? 'Pending data revision' : `Last confirmed: ${alert.confirmation_date}`)));
                                    })) : null),
                                React.createElement("div", { className: "col-9 overflow-auto" }, selectedAlert ?
                                    React.createElement(CDCEditAlert, { alertData: alertData, setAlertData: setAlertData, filter: filter, setFilter: setFilter, filterSelection: filtersByCDC['demo'], filterComponents: filterComponents, fetchAlerts: () => onAlertChanged(), selectedAlert: selectedAlert, setSelectedAlert: setSelectedAlert, cdcs: cdcs })
                                    :
                                        creationMode ?
                                            React.createElement(CDCCreateAlert, { alertData: alertData, setAlertData: setAlertData, filter: filter, setFilter: setFilter, filterComponents: filterComponents, filterSelection: filtersByCDC['demo'], fetchAlerts: () => onAlertChanged(), setSelectedAlert: setSelectedAlert, setCreationMode: setCreationMode, cdcs: cdcs })
                                            : null))),
                        React.createElement("div", { className: "modal-footer" },
                            React.createElement("button", { type: "button", className: "btn btn-secondary", "data-bs-dismiss": "modal" }, "Close"),
                            React.createElement("button", { type: "button", onClick: () => {
                                    Promise.all(alerts === null || alerts === void 0 ? void 0 : alerts.map((alert) => runAlertById(alert.id))).then(() => fetchAlerts());
                                }, className: "btn btn-secondary" }, "Sync")))))));
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
                    createCDCTextFilter(uuidv4(), 'Text Filter', { filter: [{ field: null, value: [] }], fields: [{ field: { label: 'City', value: `item["address"]["city"]` }, options: [{ label: 'Gwenborough', value: `"Gwenborough"` }, { label: 'Wisokyburgh', value: `"Wisokyburgh"` }, { label: 'McKenziehaven', value: `"McKenziehaven"` }, { label: 'Roscoeview', value: `"Roscoeview"` }, { label: 'Aliyaview', value: `"Aliyaview"` }, { label: 'Howemouth', value: `"Howemouth"` }] }, { field: { label: "Zip Code", value: `item["address"]["zipcode"]` }, options: [{ label: '33263', value: `"33263"` }, { label: '23505-1337', value: `"23505-1337"` }, { label: '58804-1099', value: `"58804-1099"` }] }, { field: { label: 'Name', value: `item["name"]` }, options: [{ label: 'Leanne Graham', value: `"Leanne Graham"` }, { label: 'Ervin Howell', value: `"Ervin Howell"` }, { label: 'Glenna Reichert', value: `"Glenna Reichert"` }, { label: 'Clementina DuBuque', value: `"Clementina DuBuque"` }] }] }),
                    createCDCCheckboxFilter(uuidv4(), 'Checkbox Filter', { fields: ['Eins', 'zwei', 'dRei'], filter: [] }),
                    createCDCRangeFilter(uuidv4(), 'Range Filter', { min: 1, max: 10 }),
                ]
            } }), this.node);
    }
}
//# sourceMappingURL=CDCFilterDialog.js.map