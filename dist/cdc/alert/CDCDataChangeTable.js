import { get } from "lodash";
import React, { useEffect } from "react";
import { useAsync } from "../../hooks";
import { confirmAlertById } from "../api";
import { ErrorMessage } from "../common/ErrorMessage";
export function CDCDataChangeTable({ selectedAlert, onAlertChanged }) {
    var _a, _b, _c, _d;
    const [dataChange, setDataChange] = React.useState(new Map());
    useEffect(() => {
        var _a, _b, _c;
        if ((_a = selectedAlert === null || selectedAlert === void 0 ? void 0 : selectedAlert.latest_diff) === null || _a === void 0 ? void 0 : _a.values_changed) {
            const change = new Map();
            (_c = (_b = selectedAlert.latest_diff) === null || _b === void 0 ? void 0 : _b.values_changed) === null || _c === void 0 ? void 0 : _c.map((d) => {
                const nestedField = d.field.map((f) => f).join('.');
                if (change.has(d.id)) {
                    change.set(d.id, change.get(d.id).set(nestedField, { old: d.old_value, new: d.new_value }));
                }
                else {
                    change.set(d.id, new Map().set(nestedField, { old: d.old_value, new: d.new_value }));
                }
            });
            setDataChange(change);
        }
        else {
            setDataChange(new Map());
        }
    }, [selectedAlert]);
    const { status: confirmStatus, error: confirmError, execute: doConfirm } = useAsync(async () => {
        const alert = await confirmAlertById(selectedAlert.id);
        onAlertChanged(alert.id);
    }, false);
    return (React.createElement(React.Fragment, null, selectedAlert.latest_diff || selectedAlert.confirmed_data ? (React.createElement(React.Fragment, null,
        React.createElement("table", { className: "table mb-0" },
            React.createElement("thead", null,
                React.createElement("tr", null,
                    React.createElement("th", { scope: "col" }, "ID"),
                    selectedAlert.compare_columns.map((field, i) => React.createElement("th", { key: field, scope: "col" }, field)),
                    React.createElement("th", { scope: "col" }, "Status"))),
            React.createElement("tbody", { style: { maxHeight: 600, overflow: 'auto' } },
                selectedAlert.latest_diff ? React.createElement(React.Fragment, null, (_b = (_a = selectedAlert.latest_diff) === null || _a === void 0 ? void 0 : _a.dictionary_item_added) === null || _b === void 0 ? void 0 :
                    _b.map((d) => {
                        const data = selectedAlert.latest_fetched_data.find((a) => a._cdc_compare_id === d);
                        return (React.createElement("tr", { key: d, className: "table-success" },
                            React.createElement("td", { scope: "row" }, data._cdc_compare_id),
                            selectedAlert.compare_columns.map((field, i) => React.createElement("td", { key: field }, get(data, field))),
                            React.createElement("td", null, "Added")));
                    }), (_d = (_c = selectedAlert.latest_diff) === null || _c === void 0 ? void 0 : _c.dictionary_item_removed) === null || _d === void 0 ? void 0 :
                    _d.map((d) => {
                        const data = selectedAlert.confirmed_data.find((a) => a._cdc_compare_id === d);
                        return (React.createElement("tr", { key: d, className: "table-danger" },
                            React.createElement("td", { scope: "row" }, data._cdc_compare_id),
                            selectedAlert.compare_columns.map((field, i) => React.createElement("td", { key: field }, get(data, field))),
                            React.createElement("td", null, "Removed")));
                    })) : null,
                selectedAlert.confirmed_data ? React.createElement(React.Fragment, null, selectedAlert.confirmed_data
                    // Only show entries which are not already shown above
                    .filter((item) => { var _a, _b, _c, _d; return !((_b = (_a = selectedAlert.latest_diff) === null || _a === void 0 ? void 0 : _a.dictionary_item_added) === null || _b === void 0 ? void 0 : _b.includes(item._cdc_compare_id)) && !((_d = (_c = selectedAlert.latest_diff) === null || _c === void 0 ? void 0 : _c.dictionary_item_removed) === null || _d === void 0 ? void 0 : _d.includes(item._cdc_compare_id)); })
                    // Sort such that rows with changes are on top
                    .sort((a, b) => (dataChange.has(b._cdc_compare_id) ? 1 : 0) - (dataChange.has(a._cdc_compare_id) ? 1 : 0)).map((d) => {
                    var _a, _b, _c, _d;
                    const id = d._cdc_compare_id;
                    const hasChanged = dataChange.has(id);
                    // TODO: All these .find() and .includes() should be refactored as they are O(n).
                    const isAlreadyHandled = ((_b = (_a = selectedAlert.latest_diff) === null || _a === void 0 ? void 0 : _a.dictionary_item_added) === null || _b === void 0 ? void 0 : _b.includes(id)) || ((_d = (_c = selectedAlert.latest_diff) === null || _c === void 0 ? void 0 : _c.dictionary_item_removed) === null || _d === void 0 ? void 0 : _d.includes(id));
                    return (isAlreadyHandled ? null :
                        React.createElement("tr", { key: id, className: `${hasChanged ? 'table-primary' : ''}` },
                            React.createElement("td", { scope: "row" }, d._cdc_compare_id),
                            selectedAlert.compare_columns.map((field) => (React.createElement(React.Fragment, { key: field }, hasChanged ? (dataChange.get(id).has(field) ? (React.createElement("td", null,
                                React.createElement("s", null, dataChange.get(id).get(field).old),
                                " ",
                                dataChange.get(id).get(field).new)) : (React.createElement("td", null, get(d, field)))) : (React.createElement("td", { key: field }, get(d, field)))))),
                            React.createElement("td", null, hasChanged ? React.createElement(React.Fragment, null, "Changed") : null)));
                })) : null)),
        selectedAlert.latest_diff ? React.createElement("div", { className: "p-1" },
            React.createElement(ErrorMessage, { error: confirmError }),
            React.createElement("div", { className: "d-md-flex justify-content-md-end" },
                React.createElement("button", { disabled: confirmStatus === 'pending', title: "Confirm changes", className: "btn btn-primary", onClick: () => doConfirm() }, "Confirm"))) : null)) : React.createElement("p", null, "No new data available")));
}
//# sourceMappingURL=CDCDataChangeTable.js.map