import React from "react";
import { accordionItem } from ".";
import { editAlert } from "./api";
import { CDCFilterComponent } from "./CDCFilterComponent";
export function CDCEditAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, alertList, setAlertList, selectedAlert, setSelctedAlert }) {
    const [editMode, setEditMode] = React.useState(false);
    React.useEffect(() => {
        setEditMode(false);
    }, [selectedAlert]);
    const generalInformation = (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "mb-3" },
            React.createElement("label", { className: "form-label" }, "Name"),
            !editMode ?
                React.createElement("p", null, alertData.name)
                :
                    React.createElement("input", { type: "text", className: "form-control", value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }) })),
        React.createElement("div", { className: "mb-3" },
            React.createElement("label", { className: "form-label" }, "CDC"),
            !editMode ?
                React.createElement("p", null, alertData.cdc_id)
                :
                    React.createElement("input", { disabled: true, type: "text", className: "form-control", value: alertData.cdc_id, onChange: (e) => setAlertData({ ...alertData, cdc_id: e.target.value }) })),
        React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: !editMode, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
        React.createElement("label", { className: "form-check-label ms-2" }, "Email notification"),
        React.createElement("div", { className: "mb-3 form-check" })));
    const onSave = async () => {
        const newAlert = await editAlert(selectedAlert.id, alertData);
        setAlertList([newAlert, ...alertList.filter((alert) => alert.id !== selectedAlert.id)]);
        setSelctedAlert(newAlert);
        setEditMode(false);
    };
    const onDiscard = () => {
        setAlertData(selectedAlert);
        setFilter(JSON.parse(selectedAlert.filter_dump));
        setEditMode(false);
    };
    const editButton = !editMode ? (React.createElement("button", { className: "btn btn-secondary", onClick: () => setEditMode(true) },
        React.createElement("i", { className: "fas fa-pencil-alt" }))) : (React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Save changes", className: "btn btn-secondary", onClick: () => onSave() },
            React.createElement("i", { className: "fas fa-save" })),
        React.createElement("button", { title: "Discard changes", className: "btn btn-secondary ms-1", onClick: () => onDiscard() },
            React.createElement("i", { className: "fas fa-ban" }))));
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
            React.createElement("h5", null, "Your options"),
            React.createElement("small", null, editButton)),
        React.createElement("div", { className: "accordion", id: "createAlert" },
            accordionItem(1, 'Alert overview', 'createAlert', generalInformation, true),
            accordionItem(2, 'New literature', 'createAlert', React.createElement("p", null, "text aufgeklappt")),
            accordionItem(3, 'Filter settings', 'createAlert', filterSelection ? (!filter ? null : React.createElement(CDCFilterComponent, { filterSelection: !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, disableFilter: !editMode })) : React.createElement("p", null, "No filters available for this cdc"))),
        editMode ?
            React.createElement("button", { className: "btn btn-secondary mt-1", onClick: () => onSave() }, "Safe")
            : null));
}
//# sourceMappingURL=CDCEditAlert.js.map